/**
 * Background entrypoint for the browser extension.
 *
 * This file intentionally stays very small: it bootstraps the Quasar BEX bridge and
 * delegates domain-specific responsibilities to the dedicated bg-modules.
 */
import { createBridge } from "#q-app/bex/background";
import { createAiTabManager } from "./bg-modules/aiTabs";
import { registerFormHandlers } from "./bg-modules/forms";
import { registerResumeHandlers } from "./bg-modules/resume";
import { registerExtractionHandlers } from "./bg-modules/dataExtraction";
import { registerNotifications } from "./bg-modules/notifications";
import { saveDefaultFonts } from "./assets/fonts/fonts";

/**
 * Opens the extension UI in a new browser tab.
 *
 * @param page - Route fragment to open inside the application, for example
 * "resume-builder" or a query-string route.
 */
function openExtension(page: string) {
  void chrome.tabs.create({
    url: chrome.runtime.getURL("www/index.html#" + page),
  });
}

chrome.runtime.onInstalled.addListener(() => {
  void saveDefaultFonts();
});

/**
 * Create the communication bridge between background script, content scripts, and app.
 * Set debug: false to disable verbose logging in production.
 */
const bridge = createBridge({ debug: false });
const { openAiSite } = createAiTabManager(bridge);

/**
 * Register all functional background modules.
 */
registerNotifications();
registerFormHandlers(bridge, openAiSite);
registerResumeHandlers(bridge, openAiSite, openExtension);
registerExtractionHandlers(bridge, openAiSite);

/**
 * Type declaration for the extension's event communication map.
 * Defines all possible events that can be sent/received via the bridge.
 */
declare module "@quasar/app-vite" {
  interface BexEventMap {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    log: [{ message: string; data?: any[] }, void];
    getTime: [never, number];

    "storage.get": [string | undefined, any];
    "storage.set": [{ key: string; value: any }, void];
    "storage.remove": [string, void];
    "extract-job-details": [{ site: string; prompt: string }];
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

/**
 * Bridge passthrough handlers that keep the dependency surface of the entrypoint small.
 */
bridge.on("openAiSite", ({ payload }) => {
  void openAiSite(payload);
});

bridge.on("openExtension", ({ payload }) => {
  openExtension(payload);
});

/**
 * Returns the parsed body text of the active browser tab for the extension UI.
 */
bridge.on("getCurrentDocumentBodyText", async () => {
  const [tab] = await chrome.tabs.query({ active: true });
  if (!tab?.id) {
    return;
  }

  return chrome.tabs.sendMessage(tab.id, {
    type: "getCurrentDocumentBodyText",
  });
});
