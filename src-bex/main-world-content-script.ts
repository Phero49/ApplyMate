/**
 * Main-world content script.
 *
 * Runs in the PAGE context so it can intercept XHR / fetch calls that are
 * inaccessible from the isolated content-script world.
 *
 * Adding support for a new provider:
 *   1. Write a `watch<Provider>()` function below.
 *   2. Register it in PROVIDER_WATCHERS with the postMessage type the
 *      content script will send (see my-content-script.ts → watchAiGeneration).
 *
 * Every watcher must emit `window.postMessage({ type: "chat-response-ready",
 * detail: { text: string } })` when the full response is assembled.
 */

import { watchChatGPT } from "./interceptors/chatgpt";
import { watchDeepSeek } from "./interceptors/deepseek";
import { watchQwen } from "./interceptors/qwen";

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

/** Map of incoming postMessage type → watcher starter function */
const PROVIDER_WATCHERS: Record<string, () => void> = {
  "chat.deepseek.com": watchDeepSeek,
  "chat.qwen.ai": watchQwen,
  "chat.openai.com": watchChatGPT,
};

window.addEventListener("message", (event: MessageEvent) => {
  if (!event.data?.type) return;
  if (event.data?.type == "listenToAi") {
    const watcher = PROVIDER_WATCHERS[location.hostname];
    if (watcher) watcher();
  }
});
