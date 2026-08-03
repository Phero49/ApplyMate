/**
 * AI tab orchestration for the browser extension.
 *
 * This module owns the logic for opening supported AI provider tabs,
 * tracking the active browser tab, and waiting for the content script to
 * confirm that the AI site is ready for prompting.
 */
import type { BexBridge } from "@quasar/app-vite";
import { states } from "./state";

export type AiPlatform = "chatgpt" | "deepseek" | "gemini" | "qwen";

/**
 * Supported AI provider URLs.
 */
const AI_SITE_URLS: Record<AiPlatform, string> = {
  chatgpt: "https://chatgpt.com",
  deepseek: "https://chat.deepseek.com",
  gemini: "https://gemini.google.com",
  qwen: "https://chat.qwen.ai",
};

/**
 * Minimal shape returned by the AI content script after a target input field becomes ready.
 */
type AiSitePayload = { url: string; port: string; id: number };

/**
 * Resolves the pending open-AI-site request once the provider becomes ready.
 */
let pendingAiSiteResolve: ((payload: AiSitePayload) => void) | null = null;

/**
 * Timeout handle used to fail the open request if the AI site never finishes loading.
 */
let pendingAiSiteTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Cancels the active AI-site timeout so it cannot resolve after the flow has already completed.
 */
function clearPendingAiSiteTimer() {
  if (pendingAiSiteTimeout !== null) {
    clearTimeout(pendingAiSiteTimeout);
    pendingAiSiteTimeout = null;
  }
}

/**
 * Creates the AI tab manager and registers the listeners used to coordinate
 * the provider tab lifecycle.
 */
export function createAiTabManager(bridge: BexBridge) {
  /**
   * Handles the content-script readiness event emitted from the provider tab.
   */
  bridge.on("aiSiteLoaded", ({ payload }) => {
    if (!states.communicateWithAiTab || !pendingAiSiteResolve) {
      return;
    }

    states.activeTabWithPort = payload;
    states.communicateWithAiTab = false;
    clearPendingAiSiteTimer();
    pendingAiSiteResolve(payload);
    pendingAiSiteResolve = null;
  });

  bridge.on("getCurrentOpenedTab", async () => {
    const [tab] = await chrome.tabs.query({ active: true });
    if (!tab?.id) {
      return;
    }

    return chrome.tabs.sendMessage(tab.id, {
      type: "getCurrentOpenedTab",
    });
  });

  const openAiSite = async (platform: AiPlatform, active = true) => {
    const [tab] = await chrome.tabs.query({ active: true });
    if (tab) {
      states.PreviousActiveTab = tab;
    }

    const aiTab = await chrome.tabs.create({
      url: AI_SITE_URLS[platform],
      active,
    });
    states.currentActiveTab = aiTab;
    states.communicateWithAiTab = true;

    return await new Promise<AiSitePayload>((resolve, reject) => {
      pendingAiSiteResolve = resolve;
      pendingAiSiteTimeout = setTimeout(() => {
        states.communicateWithAiTab = false;
        pendingAiSiteResolve = null;
        pendingAiSiteTimeout = null;
        reject(
          new Error(`AI site ${platform} failed to load within 30 seconds.`),
        );
      }, 30000);
    });
  };

  return {
    openAiSite,
  };
}
