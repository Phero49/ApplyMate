import { ref, toRaw } from "vue";
import { type Resume, useAppContext } from "src/stores/appStore";
import type { BexBridge } from "@quasar/app-vite";
import { marked } from "marked";
import highlight from "highlight.js";
import { saveGeneratedResume } from "src/db";
export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

const messages = ref<ChatMessage[]>([]);
const isStreaming = ref(false);
const error = ref<string | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function useChat(bridge: BexBridge) {
  const appContent = useAppContext();
  async function sendMessage(userContent: string) {
    if (!userContent.trim() || isStreaming.value) return;

    error.value = null;

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: userContent.trim(),
      timestamp: new Date(),
    };
    messages.value.push(userMsg);

    // Add placeholder assistant message
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: "model",
      content: "",
      timestamp: new Date(),
      streaming: true,
    };
    messages.value.push({ ...assistantMsg });

    isStreaming.value = true;

    try {
      //Send user message to ai tab
      const tabs = await chrome.tabs.query({ url: appContent.aiChatUrl });
      let tab = tabs[0];
      if (tabs.length === 0) {
        tab = await chrome.tabs.create({ url: appContent.aiChatUrl });
        //delay
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      if (tab?.id) {
        const payload = {
          type: "chatProxy",
          message: userContent,
        };

        void chrome.tabs.sendMessage(tab.id, payload);
      }

      const timeoutId = setTimeout(() => {
        //timeout error  after 30 second
        if (assistantMsg.streaming) {
          assistantMsg.streaming = false;
          error.value = "Timeout error";
          //   message
        }
      }, 30000);

      bridge.once("receiveChatProxyResponse", async ({ payload }) => {
        const aiRensponse = payload.text as string[];
        console.log("aiRensponse", payload);
        clearTimeout(timeoutId);
        aiRensponse.join("\n");
        const messageContent = await marked.parse(aiRensponse.join("\n"));
        messages.value.pop();
        messages.value.push({
          ...assistantMsg,
          streaming: false,
          content: messageContent,
        });

        if (payload.data) {
          appContent.resume = payload.data as Resume;
          if (appContent.resumeData) {
            appContent.resumeData.resume = payload.data as Resume;
            void saveGeneratedResume(toRaw(appContent.resumeData));
          }
        }
        setTimeout(() => {
          const el = document.querySelector<HTMLElement>(
            `#message-${assistantMsg.id}`,
          );
          if (el) {
            highlight.highlightElement(el);
          }
        }, 2000);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      error.value = msg;
      // Remove the empty assistant message on error
      if (!assistantMsg.content) {
        messages.value = messages.value.filter((m) => m.id !== assistantMsg.id);
      } else {
        assistantMsg.streaming = false;
      }
    } finally {
      isStreaming.value = false;
    }
  }

  function clearChat() {
    messages.value = [];
    error.value = null;
  }

  return {
    messages,
    isStreaming,
    error,

    sendMessage,
    clearChat,
  };
}
