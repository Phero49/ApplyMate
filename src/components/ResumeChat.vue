<template>
  <div class="resume-chat">
    <select-ai-models
      v-show="false"
      @update:model-value="(v) => (aiProvider = v)"
    />
    <!-- Chat Header -->
    <div class="chat-header">
      <div class="row items-center no-wrap">
        <div class="col">
          <q-field
            :disable="$route.query.href != undefined"
            dense
            borderless
            v-model="aiProvider"
            class="text-white"
            label="Select AI site"
          >
            <span class="text-white">{{ aiProvider }}</span>
            <q-menu>
              <div class="q-ma-md" style="min-width: 280px">
                <select-ai-models
                  @update:model-value="(v) => (aiProvider = v)"
                />
              </div>
            </q-menu>
            <template #prepend>
              <div>
                <div>
                  <q-avatar class="chat-model-dot" size="25px">
                    <img :src="aiIcons" alt="" />
                  </q-avatar>
                </div>
              </div>
            </template>
          </q-field>
        </div>
      </div>
    </div>
    <!-- Messages Area -->
    <div ref="messagesContainer" class="messages-area">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="empty-chat">
        <div class="sparkle-icon">
          <q-icon name="auto_awesome" size="36px" color="primary" />
        </div>
        <div class="text-subtitle2 text-white q-mt-md" style="font-weight: 600">
          AI Resume Assistant
        </div>
        <p
          class="text-grey-5 text-caption text-center q-mt-xs q-mb-lg"
          style="max-width: 220px"
        >
          Ask me to improve bullet points, rewrite your summary, or optimize for
          a job description.
        </p>
        <!-- Quick actions -->
        <div class="quick-actions">
          <q-btn
            v-for="(action, i) in quickActions"
            :key="i"
            outline
            dense
            no-caps
            size="sm"
            color="grey-6"
            class="quick-btn"
            @click="sendQuickAction(action.prompt)"
          >
            <q-icon :name="action.icon" size="14px" class="q-mr-xs" />
            {{ action.label }}
          </q-btn>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-wrapper"
        :message-id="`message-${msg.id}`"
        :class="{
          'user-message': msg.role === 'user',
          'model-message': msg.role === 'model',
        }"
      >
        <div class="message-avatar">
          <q-avatar
            :color="msg.role === 'user' ? 'primary' : 'grey-9'"
            text-color="white"
            size="24px"
            font-size="13px"
          >
            <q-icon
              :name="msg.role === 'user' ? 'person' : 'auto_awesome'"
              size="14px"
            />
          </q-avatar>
        </div>
        <div class="message-bubble">
          <div
            v-if="msg.role === 'model' && msg.content"
            class="model-text"
            v-html="renderMarkdown(msg.content)"
          ></div>
          <div v-else-if="msg.role === 'user'" class="user-text">
            {{ msg.content }}
          </div>

          <!-- Streaming indicator -->
          <div v-if="msg.streaming && !msg.content" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error bar -->
    <div v-if="error" class="error-bar">
      <q-icon name="error_outline" size="16px" class="q-mr-xs" />
      <span class="ellipsis">{{ error }}</span>
      <q-space />
      <q-btn
        flat
        dense
        round
        icon="close"
        size="xs"
        color="white"
        @click="error = null"
      />
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <q-input
        ref="chatInputRef"
        v-model="input"
        outlined
        dense
        dark
        autogrow
        placeholder="Ask about your resume..."
        class="chat-input"
        :max-height="120"
        @keydown="onKeyDown"
      >
        <template v-slot:append>
          <q-btn
            flat
            dense
            round
            :icon="isStreaming ? 'stop' : 'send'"
            :color="input.trim() || isStreaming ? 'primary' : 'grey-6'"
            :disable="!input.trim() && !isStreaming"
            @click="isStreaming ? null : send()"
          />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from "vue";
import { useChat, chatMeta } from "src/composable/useChat";
import { marked } from "marked";
import { getAiPlatformIcon } from "../utils/platformIcons";
import { useAppContext } from "src/stores/appStore";
import { useQuasar } from "quasar";
import type { BexBridge } from "@quasar/app-vite";
import SelectAiModels from "src/components/SelectAiModels.vue";
import { useRoute } from "vue-router";
import { getPlatformByUrl } from "app/src-bex/utils/utils";
import { onMounted } from "vue";
import { getChatConversation } from "src/db";

const $q = useQuasar();
const bex = $q.bex as BexBridge;
const route = useRoute();

const href = route.query.href as string | undefined;
const aiProvider = ref(getPlatformByUrl(href || "") || "deepseek");
const {
  messages,
  isStreaming,
  error,

  sendMessage,
} = useChat(bex);

const input = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const appContent = useAppContext();
const aiIcons = computed(() =>
  getAiPlatformIcon(
    appContent.aiChatUrl.length > 0 ? appContent.aiChatUrl : aiProvider.value,
  ),
);
const quickActions = [
  {
    icon: "edit_note",
    label: "Improve summary",
    prompt:
      "Please review and improve my resume summary to be more impactful and concise.",
  },
  {
    icon: "work",
    label: "Better bullets",
    prompt:
      "Rewrite my experience bullet points using the STAR method with quantifiable metrics.",
  },
  {
    icon: "psychology",
    label: "ATS tips",
    prompt:
      "What changes should I make to optimize my resume for Applicant Tracking Systems (ATS)?",
  },
  {
    icon: "rate_review",
    label: "Overall review",
    prompt:
      "Give me an overall review of my resume with specific actionable improvements.",
  },
];

// Auto-scroll when new messages arrive or content streams
watch(
  () => messages.value[messages.value.length - 1]?.content,
  () => scrollToBottom(),
);

watch(
  () => messages.value.length,
  () => scrollToBottom(),
);

function scrollToBottom() {
  void nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function onKeyDown(e: KeyboardEvent) {
  if (isStreaming.value) {
    return;
  }
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    void send();
  }
}
async function send() {
  if (!input.value.trim() || isStreaming.value) return;
  const text = input.value;
  const url = route.query.href as string | undefined;
  if (url) {
    let [tab] = await chrome.tabs.query({ url: url });
    console.log("input", input.value);
    if (tab == undefined) {
      tab = await chrome.tabs.create({
        url: (route.query.href as string) || "",
        active: false,
      });
      const n = $q.notify({
        position: "top-left",
        message:
          "opening " + aiProvider.value + " site it might  take some time",
        group: false,
        spinner: true,
        color: "red-8",
      });
      bex.once("aiSiteWindowLoaded", () => {
        n({
          message:
            aiProvider.value +
            " window has loaded waiting for input to be ready",
          spinner: true,
          color: "blue-6",
        });
      });
      bex.once("aiSiteReady", () => {
        n({
          message: aiProvider.value + " is now ready to receive inputs",
          spinner: false,
          icon: "check",
          timeout: 2000,
          color: "green-6",
        });

        void sendMessage(text, url);
      });
    } else {
      await sendMessage(text, url);
    }
  }
  input.value = "";
}

async function sendQuickAction(prompt: string) {
  input.value = "";
  const url = route.query.href as string | undefined;

  await sendMessage(prompt, url || "");
}

function renderMarkdown(text: string): string {
  try {
    return marked.parse(text, { async: false, breaks: true });
  } catch {
    return text;
  }
}

onMounted(async () => {
  const chat = await getChatConversation(href || "");
  if (chat) {
    messages.value = chat.messages.map((v) => {
      return {
        ...v,
        timestamp: new Date(v.timestamp),
      };
    });
    chatMeta.id = chat.id;
    chatMeta.title = chat.title;
  }
});
bex.on("responseChunk", ({ payload }) => {
  const last = messages.value.at(-1);
  if (last && last.role == "model") {
    last.content = payload.text;
  }
});
</script>

<style scoped>
.resume-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  overflow: hidden;
}

/* ---------- Chat Header ---------- */
.chat-header {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.chat-model-dot {
  background-color: white;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.model-select {
  font-size: 0.8rem;
  min-width: 140px;
}

.model-select :deep(.q-field__native) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.8rem;
}

/* ---------- Messages ---------- */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  scroll-behavior: smooth;
}

.messages-area::-webkit-scrollbar {
  width: 10px;
  cursor: hand;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* ---------- Empty Chat ---------- */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.sparkle-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.quick-btn {
  border-radius: 10px;
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  padding: 6px 12px;
  text-align: left;
  justify-content: flex-start;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
  color: rgba(255, 255, 255, 0.85);
}

/* ---------- Message Bubbles ---------- */
.message-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  animation: msgSlide 0.25s ease both;
}

@keyframes msgSlide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
  padding-top: 2px;
}

.message-bubble {
  flex: 1;
  min-width: 0;
}

.user-text {
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 12px;
  border-top-left-radius: 4px;
  padding: 10px 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.83rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.model-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.83rem;
  line-height: 1.6;
  word-break: break-word;
}

.model-text :deep(p) {
  margin: 0 0 8px;
}

.model-text :deep(p:last-child) {
  margin-bottom: 0;
}

.model-text :deep(ul),
.model-text :deep(ol) {
  margin: 4px 0 8px;
  padding-left: 18px;
}

.model-text :deep(li) {
  margin-bottom: 4px;
}

.model-text :deep(code) {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.8rem;
  font-family: "Fira Code", monospace;
}

.model-text :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.model-text :deep(pre code) {
  background: none;
  padding: 0;
}

.model-text :deep(strong) {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
}

.model-text :deep(h1),
.model-text :deep(h2),
.model-text :deep(h3) {
  color: white;
  margin: 12px 0 6px;
  font-size: 0.9rem;
  font-weight: 700;
}

.model-text :deep(blockquote) {
  border-left: 3px solid var(--q-primary);
  margin: 8px 0;
  padding: 4px 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* ---------- Typing Indicator ---------- */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--q-primary);
  opacity: 0.4;
  animation: typingBounce 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%,
  80%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.3);
    opacity: 1;
  }
}

/* ---------- Error Bar ---------- */
.error-bar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.15);
  border-top: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  font-size: 0.78rem;
  flex-shrink: 0;
}

/* ---------- Chat Input ---------- */
.chat-input-area {
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.chat-input :deep(.q-field__control) {
  border-radius: 12px;
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.chat-input :deep(.q-field__control:hover) {
  border-color: rgba(249, 115, 22, 0.3);
}

.chat-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.12);
}

.chat-input :deep(.q-field__native) {
  font-size: 0.83rem;
  max-height: 100px;
}
</style>
