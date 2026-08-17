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
import jsonSchema from "./assets/schema.txt?raw";
import { Readability } from "@mozilla/readability";
import { fillFromAIMappings, prepareFormForAI } from "./utils/utils";
import {
  createNotification,
  type NotificationData,
} from "./utils/notification";
import {
  currentSelector,
  dispatchEnter,
  fillInput,
  waitForSelector,
} from "./utils/aiPageUtils";
import {
  chatResponseReady,
  onChunkResponse,
} from "./listeners/mainWorldToContentScript";
const bridge = createBridge({ debug: false });

declare module "@quasar/app-vite" {
  interface BexEventMap {
    "some.event": [{ someProp: string }, void];
    "show-notification": [NotificationData, void];
  }
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
  const prompt = `${resumeGenerationPrompt}\n\nUSER'S RAW DATA:\n${payload.resumeData}\n\nTARGET JOB DESCRIPTION:\n${payload.jobDescription}\n\n 
  \n\n Expected resume json structure  \n\n
   ${jsonSchema}
\n\n
  Now, generate the optimized resume using only the user data provided and the job description.`;
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

  // Trigger the main-world interceptor for this provider
  window.postMessage({ type: "listenToAi" }, location.origin);

  window.addEventListener("message", (event) => {
    if (event.data.type === "chat-response-ready") {
      chatResponseReady(event, bridge, callback);
    }
    if (event.data.type === "chat-response-chunk") {
      onChunkResponse(event, bridge);
      console.log("chunk");
    }
  });

  console.log("[ApplyMate] watchAiGeneration started for", hostname);
}

// Bridge connection
void bridge.connectToBackground();

// Initialize
// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener("load", initializeAISite);
