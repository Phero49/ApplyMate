// Import the BexBridge type from Quasar's app-vite plugin for cross-extension communication
import type { BexBridge } from "@quasar/app-vite";
// Import the list of AI website URLs from the utilities
import { aiSites } from "app/src-bex/utils/utils";
// Import Quasar's notification system for user feedback
import { Notify } from "quasar";
import { resumeSchema } from "src/assets/schema/resemeSchema";
import { saveChatConversation, saveGeneratedResume } from "src/db";
// Import Vue's ref function for reactive state management
import { ref } from "vue";
import type { Router } from "vue-router";

interface FirstMessagePayload {
  mgs: Mgs;
  window: Window;
}

export interface Mgs {
  data: string;
  text: Array<null | string>;
}

export interface Window {
  url: string;
  title: string;
  port: string;
  favIconUrl: string;
}

/**
 * A composable function for managing the process of generating a new AI-powered resume/CV.
 * Handles communication with AI sites through the browser extension bridge.
 *
 * @param bex - The BexBridge instance for extension-to-content-script communication
 * @returns An object containing reactive state and methods for resume generation
 */
export const useGenerateNewAiResume = (bex: BexBridge, router: Router) => {
  /**
   * The initial message to send to the AI when starting a new chat.
   * Default message indicates the user will later ask for resume help.
   */
  const firstMessage = ref("later i will ask you to help me craft a resume/cv");

  /**
   * Whether to include the user's profile information in the request.
   * When true, the user's personal details will be sent to the AI.
   */
  const includeProfile = ref(true);

  /**
   * Whether to include a custom prompt in the request.
   * When true, the selected prompt template will be sent to the AI.
   */
  const includePrompt = ref(false);

  /**
   * The selected prompt template to use for the AI request.
   * Default is "default", but can be customized with other templates.
   */
  const selectedPrompt = ref("default");

  /**
   * The AI provider/service to use for resume generation.
   * Currently configured to use "deepseek" as the provider.
   */
  const aiProvider = ref("deepseek");

  /**
   * Whether the first message has been written and is ready to send.
   * Set to true when the AI site is ready and we can send the initial message.
   */
  const writeFirstMessage = ref(false);

  /**
   * Reference to the browser tab where the AI site is loaded.
   * Used to send messages to the content script in that specific tab.
   */
  const targetTab = ref<chrome.tabs.Tab | null>(null);

  /**
   * Sends the first message to the AI site via the content script.
   * Displays notifications for success/failure and listens for responses.
   *
   * @returns {void}
   */
  const sendMessage = () => {
    // Check if a target tab exists before sending the message
    if (targetTab.value) {
      // Send a message to the content script in the target tab
      void chrome.tabs.sendMessage(targetTab.value.id!, {
        type: "newChat", // Message type identifier
        payload: firstMessage.value + resumeSchema, // The message content
      });

      // Notify the user that the message was sent
      const dismiss = Notify.create({
        spinner: true,
        type: "positive",
        message:
          "Message sent to " +
          aiProvider.value +
          " site waiting for response  ",
        position: "top-right",
        timeout: 15000,
      });

      // Set up a listener for the response from the content script
      bex.on("firstMessageResponse", async ({ payload }) => {
        // Notify the user when a response is received
        dismiss();
        const p = payload as FirstMessagePayload;
        Notify.create({
          type: "positive",
          message: "Response received from " + aiProvider.value + " site  ",
          position: "top-right",
        });
        await saveGeneratedResume({
          chatUrl: p.window.url,
          title: p.window.title,
          url: p.window.url,
          createdAt: new Date().toISOString(),
          resume: p.mgs.data,
        });

        const genId = () => {
          const now = Date.now().toString();
          const id = now.substring(now.length - 6, now.length);
          return id;
        };

        await saveChatConversation({
          createdAt: new Date().toISOString(),
          id: p.window.url,
          messages: [
            {
              content: firstMessage.value,
              id: genId(),
              role: "user",
              timestamp: new Date().toISOString(),
            },
            {
              content: p.mgs.text.join(" "),
              id: genId(),
              role: "model",
              timestamp: new Date().toISOString(),
            },
          ],
          title: p.window.title,
          updatedAt: new Date().toISOString(),
        });
        void router.push({
          path: "/app/resume-builder",
          query: { href: p.window.url },
        });
      });
    } else {
      // Show error notification if no target tab is available
      Notify.create({
        type: "negative",
        message: "Target tab is not available",
        icon: "error",
        position: "top-right",
      });
    }
  };

  /**
   * Creates a new resume by opening the AI site in a background tab and
   * setting up listeners for site readiness events.
   *
   * @async
   * @returns {Promise<void>}
   */
  async function createNewResume(): Promise<void> {
    // Get the URL for the selected AI provider
    const url = aiSites["deepseek"];

    // Open the AI site in a new background tab (not active)
    const tab = await chrome.tabs.create({ url: url, active: false });

    // Create a notification that will be updated as the process progresses
    const n = Notify.create({
      group: false,
      spinner: true,
      message: "opening " + aiProvider.value + " site it might some time",
      color: "green",
      position: "top-right",
    });

    // Exit if the tab was not created successfully
    if (tab.id == undefined) {
      return;
    }

    // After 1 second, update the notification to indicate waiting for site readiness
    setTimeout(() => {
      n({ message: "waiting for site to be ready", color: "red" });
    }, 1000);

    // Listen for the AI site's window loaded event
    bex.once("aiSiteWindowLoaded", () => {
      n({
        message: aiProvider.value + "site loaded waiting to start a new chat ",
        color: "green",
      });
    });

    // Listen for the AI site's ready event (fully loaded and interactive)
    bex.once("aiSiteReady", () => {
      n({
        message: aiProvider.value + "site ready to start a new chat ",
        color: "green",
        timeout: 2000,
      });

      // Store the tab reference for future message sending
      targetTab.value = tab;

      // Signal that the first message is ready to be sent
      writeFirstMessage.value = true;
    });
  }

  // Return all reactive state and methods for use in components
  return {
    firstMessage,
    includeProfile,
    includePrompt,
    selectedPrompt,
    aiProvider,
    writeFirstMessage,
    targetTab,
    sendMessage,
    createNewResume,
  };
};
