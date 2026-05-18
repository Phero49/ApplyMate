/**
 * Importing the file below initializes the content script.
 *
 * Warning:
 *   Do not remove the import statement below. It is required for the extension to work.
 *   If you don't need createBridge(), leave it as "import '#q-app/bex/content'".
 */
import { createBridge } from "#q-app/bex/content";
import resumeGenerationPrompt from "./assets/prompts/resumeGenerationPrompt.txt?raw";
// The use of the bridge is optional.
const bridge = createBridge({ debug: false });
/**
 * bridge.portName is 'content@<path>-<number>'
 *   where <path> is the relative path of this content script
 *   filename (without extension) from /src-bex
 *   (eg. 'my-content-script', 'subdir/my-script')
 *   and <number> is a unique instance number (1-10000).
 */

declare module "@quasar/app-vite" {
  interface BexEventMap {
    "some.event": [{ someProp: string }, void];
  }
}

// Hook into the bridge to listen for events sent from the other BEX parts.
bridge.on("some.event", ({ payload }) => {
  if (payload.someProp) {
    // Access a DOM element from here.
    // Document in this instance is the underlying website the contentScript runs on
    const el = document.getElementById("some-id");
    if (el) {
      el.innerText = "Quasar Rocks!";
    }
  }
});

/**
 * Leave this AFTER you attach your initial listeners
 * so that the bridge can properly handle them.
 *
 * You can also disconnect from the background script
 * later on by calling bridge.disconnectFromBackground().
 *
 * To check connection status, access bridge.isConnected
 */
bridge
  .connectToBackground()
  .then(() => {
    console.log("Connected to background");
  })
  .catch((err) => {
    console.error("Failed to connect to background:", err);
  });

let maxRetries = 100;
let currentSelector = "";
const waitForselector = (selector: string) => {
  return new Promise((resolve) => {
    currentSelector = selector;
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
      maxRetries--;
      if (maxRetries === 0) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
};

const fillInput = (selector: string, value: string) => {
  const element = document.querySelector<HTMLTextAreaElement>(selector);
  if (element) {
    //check if element is textarea
    if (element.tagName === "TEXTAREA") {
      element.value = value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    //check if element is contenteditable
    else if (element.getAttribute("contenteditable") === "true") {
      element.innerText = value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
};

const onPageLoaded = () => {
  void bridge.send({
    event: "aiSiteLoaded",
    payload: {
      url: window.location.href,
      title: document.title,
      port: bridge.portName,
      favIconUrl: document
        .querySelector("link[rel='icon']")
        ?.getAttribute("href"),
    },
    to: "background",
  });
};
// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener("load", async () => {
  if (
    [
      "chatgpt.com",
      "chat.deepseek.com",
      "gemini.google.com",
      "chat.qwen.ai",
    ].includes(window.location.hostname)
  ) {
    switch (window.location.hostname) {
      case "chatgpt.com":
        await waitForselector("[contenteditable=true]");
        onPageLoaded();
        break;

      case "chat.deepseek.com":
        await waitForselector("textarea");
        debugger;
        onPageLoaded();
        break;

      case "gemini.google.com":
        await waitForselector("rich-textarea");
        onPageLoaded();
        break;

      case "chat.qwen.ai":
        await waitForselector("textarea");
        onPageLoaded();
        break;
    }
  }
});

bridge.on("generate-resume", ({ payload }) => {
  const prompt = `
   ${resumeGenerationPrompt}
   
   USER'S RAW DATA:
   ${payload.resumeData}

   TARGET JOB DESCRIPTION:
   ${payload.jobDescription}

   Now, generate the optimized resume using only the user data provided and the job description.
   `;

  fillInput(currentSelector, prompt);
  watchAiGeneration();
});

bridge.on("getDomContents", () => {
  console.log("bex can listen");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.event === "getJobDetails") {
    sendResponse({ jobDetails: document.body.textContent });
  }
});

function watchDeepSeek() {
  const elements = Array.from(document.querySelectorAll(".ds-markdown"));
  console.log(elements.length);
  if (elements.length === 0) {
    //retry 40 times with 1000s interval
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        watchDeepSeek();
      }, 1000);
    }
    return;
  }

  const lastElement = elements.at(-1);
  if (lastElement) {
    let timeout: NodeJS.Timeout;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const observer = new MutationObserver((_) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert("stop");
      }, 4000);
    });
    observer.observe(lastElement, { childList: true, subtree: true });
  }
}

function watchAiGeneration() {
  switch (window.location.hostname) {
    case "chatgpt.com":
      break;

    case "chat.deepseek.com":
      watchDeepSeek();
      break;

    case "gemini.google.com":
      void waitForselector("rich-textarea");
      onPageLoaded();
      break;

    case "chat.qwen.ai":
      void waitForselector("textarea");
      onPageLoaded();
      break;
  }
}
