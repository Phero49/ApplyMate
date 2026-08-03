/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Importing the file below initializes the content script.
 *
 * Warning:
 *   Do not remove the import statement below. It is required for the extension to work.
 *   If you don't need createBridge(), leave it as "import '#q-app/bex/content'".
 */
import { createBridge } from "#q-app/bex/content";
import resumeGenerationPrompt from "./assets/prompts/resumeGenerationPrompt.txt?raw";
import { Readability } from "@mozilla/readability";
import { fillFromAIMappings, prepareFormForAI } from "./utils/utils";
import {
  createNotification,
  type NotificationData,
} from "./utils/notification";

const bridge = createBridge({ debug: false });

declare module "@quasar/app-vite" {
  interface BexEventMap {
    "some.event": [{ someProp: string }, void];
    "show-notification": [NotificationData, void];
  }
}

function getGeminiInput(): HTMLElement | null {
  const el = document.querySelector<HTMLElement>("rich-textarea");
  if (el) {
    const input = el.querySelector<HTMLElement>("[contenteditable=true]");
    if (input) {
      return input;
    }
    const shadowRoot = chrome.dom.openOrClosedShadowRoot(el);
    if (shadowRoot) {
      return shadowRoot.querySelector<HTMLElement>("[contenteditable=true]");
    }
  }
  return null;
}

// Configuration
const AI_SITES = {
  "chatgpt.com": () => "[contenteditable=true]",
  "chat.deepseek.com": () => "textarea",
  "gemini.google.com": () => "rich-textarea",
  "chat.qwen.ai": () => "textarea",
} as const;

/** postMessage type that triggers the main-world watcher for each provider */

const AI_HOSTNAMES = Object.keys(AI_SITES) as Array<keyof typeof AI_SITES>;

let currentSelector = "";
function getElementBySelector(selector: string) {
  if (selector === "rich-textarea") {
    return getGeminiInput();
  }
  return document.querySelector<HTMLElement>(selector);
}

/**
 * Waits for an element matching the given selector to appear in the DOM.
 *
 * The DOM is checked once every second for up to 75 attempts (75 seconds).
 *
 * @param selector - The selector used to locate the element.
 * @returns A promise that resolves with the found element or rejects if it
 *          cannot be found within the timeout period.
 */
const waitForSelector = (selector: string): Promise<Element> => {
  // Maximum number of polling attempts (75 seconds).
  const maxAttempts = 75;

  // Tracks how many times we've checked for the element.
  let attempts = 0;

  // Store the selector so other parts of the extension know what we're waiting for.
  currentSelector = selector;

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      attempts++;

      // Try to locate the element.
      const element = getElementBySelector(selector);

      // Resolve immediately when the element is found.
      if (element) {
        clearInterval(interval);
        resolve(element);
        return;
      }

      // Stop polling after the maximum number of attempts.
      if (attempts >= maxAttempts) {
        clearInterval(interval);

        reject(
          new Error(
            "Failed to locate the input field. Please make sure you're logged in or check your network connection.",
          ),
        );
      }
    }, 1000);
  });
};

const fillInput = (
  selector: string,
  value: string,
  timeoutMs: number = 5000,
): Promise<void> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const attemptFill = () => {
      const element = getElementBySelector(selector);

      if (element) {
        // Element found - fill it
        if (element instanceof HTMLTextAreaElement) {
          element.value = value;
          element.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (element.getAttribute("contenteditable") === "true") {
          element.innerText = value;
          element.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // Clean up and resolve
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        resolve();
        return;
      }

      // Check if timeout has been reached
      if (Date.now() - startTime >= timeoutMs) {
        // Clean up and exit quietly (resolve without doing anything)
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        resolve(); // Quiet exit - resolve without error
        return;
      }
    };

    // Initial attempt
    attemptFill();

    // Set up retry interval (every 2 seconds)
    intervalId = setInterval(attemptFill, 2000);

    // Set up overall timeout
    timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      resolve(); // Quiet exit on timeout
    }, timeoutMs);
  });
};
const getPageInfo = () => {
  const icon = document.querySelector("link[rel='icon']")?.getAttribute("href");
  const url = new URL(icon || "", location.origin).href;
  return {
    url: window.location.href,
    title: document.querySelector("title")?.textContent || "unknown title",
    port: bridge.portName,
    favIconUrl: url,
  };
};

/**
 * Initializes AI site detection.
 *
 * If the current page belongs to a supported AI website, this function waits
 * for the site's main input element to become available before notifying the
 * background script that the site is ready.
 */
const initializeAISite = async () => {
  try {
    // Exit early if the current website is not supported.
    if (!AI_HOSTNAMES.includes(window.location.hostname as any)) {
      return;
    }

    // Get the selector for the current AI website.
    const selector =
      AI_SITES[window.location.hostname as keyof typeof AI_SITES]();

    void bridge.send({
      event: "aiSiteWindowLoaded",
      to: "app",
    });
    // Wait until the site's input element is available.
    await waitForSelector(selector);

    // Notify the background script that the AI site has finished loading.
    void bridge.send({
      event: "aiSiteLoaded",
      payload: getPageInfo(),
      to: "background",
    });

    void bridge.send({
      event: "aiSiteReady",
      to: "app",
    });
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Failed to initialize AI site detection:", error);

    // Notify the background script that initialization failed.
    void bridge.send({
      event: "aiSiteLoadError",
      payload: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred.",
        hostname: window.location.hostname,
      },
      to: "background",
    });
  }
};
// Message handlers

const messageListeners: Record<string, (data?: any) => any> = {
  getCurrentOpenedTab: getPageInfo,

  getJobDetails: () => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("script").forEach((script) => script.remove());
    clone.querySelectorAll("style").forEach((style) => style.remove());
    clone.querySelectorAll("header").forEach((header) => header.remove());
    clone.querySelectorAll("footer").forEach((header) => header.remove());
    clone
      .querySelectorAll("[style*='display: none']")
      .forEach((el) => el.remove());
    clone.querySelectorAll("button").forEach((btn) => btn.remove());
    return {
      jobDetails: clone.textContent
        ?.replace(/ {2} +/g, " ")
        .replace(/^\n.\n/g, ""),
      url: location.href,
      title: document.title,
    };
  },

  getCurrentDocumentBodyText: () => {
    const clone = document.cloneNode(true);
    const readability = new Readability(clone as Document).parse();
    console.log(readability);
    return {
      data: {
        title: readability?.title,
        textContent: readability?.textContent,
      },
      window: {
        ...getPageInfo(),
      },
    };
  },

  getFormMappings: () => {
    return prepareFormForAI().cleanedHTML;
  },
  fillForm: ({ payload }) => {
    fillFromAIMappings(payload);
  },
  showNotification: ({ payload }) => {
    createNotification(payload);
    console.log(payload, "notification");
  },
  async newChat({ payload }) {
    await initializeAISite();
    await waitForSelector(currentSelector);
    await fillInput(currentSelector, payload);
    watchAiGeneration((data, text) => {
      setTimeout(() => {
        console.log("-------->", getPageInfo(), document.title);
        void bridge.send({
          event: "firstMessageResponse",
          payload: {
            mgs: {
              data,
              text,
            },
            window: getPageInfo(),
          },
          to: "app",
        });
      }, 2000);
    });

    setTimeout(() => {
      dispatchEnter(document.querySelector(currentSelector) as HTMLElement);
    }, 2000);
    //messageListeners["chatProxy"]!({ message: payload });
  },
  chatProxy: async (payload) => {
    const msg = payload.message as string;
    await fillInput(currentSelector, msg);
    watchAiGeneration((data, text) => {
      void bridge.send({
        event: "chatProxyResponse",
        payload: {
          data,
          text,
          window: getPageInfo(),
        },
        to: "app",
      });
    });
    setTimeout(() => {
      dispatchEnter(document.querySelector(currentSelector) as HTMLElement);
    }, 2000);
  },
};
// Chrome runtime message handler
chrome.runtime.onMessage.addListener((message, sender, response) => {
  const listener = messageListeners[message.type];
  if (listener) {
    response(listener(message));
  }
});

bridge.on("generate-resume", async ({ payload }) => {
  const prompt = `${resumeGenerationPrompt}\n\nUSER'S RAW DATA:\n${payload.resumeData}\n\nTARGET JOB DESCRIPTION:\n${payload.jobDescription}\n\n Now, generate the optimized resume using only the user data provided and the job description.`;
  await fillInput(currentSelector, prompt);
  watchAiGeneration((data) => {
    console.log(data, "data resume");
    void bridge.send({
      event: "resumeGenerated",
      payload: {
        resume: data,
        url: window.location.href,
        sourceUrl: payload.url,
        chatUrl: window.location.href,
        title: payload.title,
      },
      to: "background",
    });
  });
  setTimeout(() => {
    dispatchEnter(document.querySelector(currentSelector) as HTMLElement);
  }, 2000);
});

bridge.on("extract-job-details", async ({ payload }) => {
  // TODO: Implement job details extraction
  await fillInput(currentSelector, payload);
  watchAiGeneration((data) => {
    console.log(data, "data extract");
    void bridge.send({
      event: "extract-job-details",
      to: "background",
      payload: data,
    });
  });
  setTimeout(() => {
    dispatchEnter(document.querySelector(currentSelector) as HTMLElement);
  }, 2000);
});

function dispatchEnter(element: HTMLElement) {
  element.focus();

  element.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );
}

bridge.on("fillForm", async ({ payload }) => {
  await fillInput(currentSelector, payload.html);
  watchAiGeneration((data) => {
    void bridge.send({
      event: "formFilled",
      payload: data,
      to: "background",
    });
  });
  setTimeout(() => {
    dispatchEnter(document.querySelector(currentSelector) as HTMLElement);
  }, 2000);
});

bridge.on("showNotification", ({ payload }) => {
  createNotification(payload);
});

// Watch AI generation
function watchAiGeneration(callback: (data: any, text?: string[]) => void) {
  const hostname = window.location.hostname;

  // // Providers that need DOM-only polling don't use the main-world bridge
  // const DOM_ONLY_PROVIDERS = ["chatgpt.com", "gemini.google.com"];

  // if (!DOM_ONLY_PROVIDERS.includes(hostname)) {
  //   console.warn("[ApplyMate] No watcher configured for", hostname);
  //   return;
  // }

  // Trigger the main-world interceptor for this provider
  window.postMessage({ type: "listenToAi" }, location.origin);

  window.addEventListener("message", (event) => {
    if (event.data.type === "chat-response-ready") {
      console.log(event.data.detail.text, "response from ai");
      const parts = event.data.detail.text.split(/```(?:json)+/, 2);
      const secondPart = parts.length > 1 ? parts[1]?.split("```", 2) : null;
      const jsonString = secondPart?.[0] || null;
      const noneCodeBlock = [parts[0], secondPart?.[1]];

      const json =
        jsonString && jsonString.length > 2 ? JSON.parse(jsonString || "") : "";
      console.log(json, noneCodeBlock, "response from ai");
      callback(json, noneCodeBlock);
    }
  });

  console.log("[ApplyMate] watchAiGeneration started for", hostname);
}

// Bridge connection
bridge
  .connectToBackground()
  .then(() => console.log("Connected to background"))
  .catch((err) => console.error("Failed to connect to background:", err));

// Initialize
// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener("load", initializeAISite);
