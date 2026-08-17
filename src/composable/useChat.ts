import { reactive, ref, toRaw } from "vue";
import type { BexBridge } from "@quasar/app-vite";
import { marked } from "marked";
import highlight from "highlight.js";
import {
  saveChatConversation,
  saveGeneratedResume,
  type ChatConversation,
  type ChatMessageRecord,
} from "src/db";
import { useAppContext } from "src/stores/appStore";
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
const timeoutId = ref();
export const chatMeta = reactive({
  id: "",
  title: "",
});

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function toRecord(message: ChatMessage): ChatMessageRecord {
  const record: ChatMessageRecord = {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp.toISOString(),
  };

  if (message.streaming !== undefined) {
    record.streaming = message.streaming;
  }

  return record;
}

async function persistConversation() {
  const now = new Date().toISOString();

  const conversation: ChatConversation = {
    id: chatMeta.id,
    title: chatMeta.title,
    createdAt: messages.value[0]?.timestamp.toISOString() || now,
    updatedAt: now,
    messages: messages.value.map(toRecord),
  };

  await saveChatConversation(conversation);
}

export function useChat(bridge: BexBridge) {
  const appContent = useAppContext();
  async function sendMessage(userContent: string, url: string) {
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
    await persistConversation();

    // Add placeholder assistant message
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: "model",
      content: "",
      timestamp: new Date(),
      streaming: true,
    };
    messages.value.push({ ...assistantMsg });
    await persistConversation();

    isStreaming.value = true;

    try {
      //Send user message to ai tab
      const tabs = await chrome.tabs.query({ url: url });
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

      timeoutId.value = setTimeout(() => {
        //timeout error  after 30 second
        if (assistantMsg.streaming) {
          assistantMsg.streaming = false;
          error.value = "Timeout error";
          messages.value = messages.value.filter(
            (m) => m.id !== assistantMsg.id,
          );
          //   message
        }
      }, 30000); // 30 seconds timeout

      bridge.once("chatProxyResponse", async ({ payload }) => {
        debugger;
        const aiRensponse = payload.text as string[];
        console.log(payload, "<---000000000000000000---->");
        clearTimeout(timeoutId.value);
        const messageContent = await marked.parse(aiRensponse.join("\n"));
        messages.value.pop();
        messages.value.push({
          ...assistantMsg,
          streaming: false,
          content: messageContent,
        });
        await persistConversation();

        if (payload.data) {
          appContent.resume = payload.data as FlexibleResume;
          if (appContent.resumeData) {
            appContent.resumeData.resume = payload.data as FlexibleResume;
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

  async function clearChat() {
    messages.value = [];
    error.value = null;
    await persistConversation();
  }

  function cancelTimeout() {
    if (timeoutId.value != undefined) {
      clearTimeout(timeoutId.value);
    }
  }
  return {
    messages,
    isStreaming,
    cancelTimeout,
    error,
    sendMessage,
    clearChat,
  };
}
