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
let maxRetries = 100;

function getElementBySelector(selector: string) {
  if (selector === "rich-textarea") {
    return getGeminiInput();
  }
  return document.querySelector<HTMLElement>(selector);
}

const waitForSelector = (selector: string) => {
  console.log(selector, "selector");
  return new Promise((resolve) => {
    currentSelector = selector;
    const interval = setInterval(() => {
      const element = getElementBySelector(selector);
      if (element || maxRetries-- === 0) {
        clearInterval(interval);
        resolve(element || null);
      }
    }, 100);
  });
};

const fillInput = (selector: string, value: string) => {
  const element = getElementBySelector(selector);
  if (!element) return;

  if (element instanceof HTMLTextAreaElement) {
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  } else if (element.getAttribute("contenteditable") === "true") {
    element.innerText = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
};

const getPageInfo = () => {
  const icon = document.querySelector("link[rel='icon']")?.getAttribute("href");
  const url = new URL(icon || "", location.origin).href;
  return {
    url: window.location.href,
    title: document.title,
    port: bridge.portName,
    favIconUrl: url,
  };
};

// Initialize AI site detection
const initializeAISite = async () => {
  if (!AI_HOSTNAMES.includes(window.location.hostname as any)) return;

  const selector =
    AI_SITES[window.location.hostname as keyof typeof AI_SITES]();
  await waitForSelector(selector);
  console.log("send to bg");
  void bridge.send({
    event: "aiSiteLoaded",
    payload: getPageInfo(),
    to: "background",
  });
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
  chatProxy: ({ payload }) => {
    const { message } = payload;
    fillInput(currentSelector, message);
    watchAiGeneration((data, text) => {
      void bridge.send({
        event: "chatProxyResponse",
        payload: {
          data,
          text,
        },
        to: "background",
      });
      void bridge.send({
        event: "resumeGenerated",
        payload: {
          resume: data,
          url: payload.url,
          chatUrl: window.location.href,
          title: payload.title,
        },
        to: "background",
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

bridge.on("generate-resume", ({ payload }) => {
  const prompt = `${resumeGenerationPrompt}\n\nUSER'S RAW DATA:\n${payload.resumeData}\n\nTARGET JOB DESCRIPTION:\n${payload.jobDescription}\n\nNow, generate the optimized resume using only the user data provided and the job description.`;
  fillInput(currentSelector, prompt);
  watchAiGeneration((data) => {
    console.log(data, "data resume");
    void bridge.send({
      event: "resumeGenerated",
      payload: {
        resume: data,
        url: payload.url,
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

bridge.on("extract-job-details", ({ payload }) => {
  // TODO: Implement job details extraction
  fillInput(currentSelector, payload);
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

bridge.on("fillForm", ({ payload }) => {
  fillInput(currentSelector, payload.html);
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
      const parts = event.data.detail.text.split(/```(?:json)+/);
      const secondPart = parts.length > 1 ? parts[1].split("```") : null;
      const jsonString = secondPart?.[0] || null;
      const noneCodeBlock = [parts[0], secondPart?.[1]];
      const json = JSON.parse(jsonString);
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
