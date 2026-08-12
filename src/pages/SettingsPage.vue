<template>
  <q-page class="settings-page">
    <!-- Header -->
    <div class="settings-header">
      <div>
        <div class="settings-title">Settings</div>
        <div class="settings-subtitle">
          Fonts, prompts, AI defaults and reminder behaviour.
        </div>
      </div>
      <q-btn
        class="save-btn"
        icon="save"
        label="Save settings"
        unelevated
        no-caps
        @click="saveSettings"
      />
    </div>

    <!-- Section tabs -->
    <q-tabs
      v-model="activeTab"
      class="settings-tabs"
      indicator-color="transparent"
      active-class="tab-active"
      no-caps
      dense
      align="left"
    >
      <q-tab name="general" icon="tune" label="General" />
      <q-tab
        name="prompts"
        icon="notes"
        :label="`Prompts (${prompts.length})`"
      />
      <q-tab
        name="fonts"
        icon="font_download"
        :label="`Fonts (${fonts.length})`"
      />
    </q-tabs>

    <div class="column items-center">
      <q-tab-panels v-model="activeTab" animated class="settings-panels">
        <!-- GENERAL -->
        <q-tab-panel name="general" class="settings-panel">
          <section class="settings-card">
            <header class="card-header">
              <q-icon name="smart_toy" size="20px" />
              <div>
                <div class="card-title">Default AI provider</div>
                <div class="card-caption">
                  Used automatically by popup actions.
                </div>
              </div>
            </header>

            <div class="card-body">
              <SelectAiModels @update:modelValue="onAiChange" />
              <div class="active-provider-row">
                <span class="dim">Active provider</span>
                <q-chip dense square class="provider-chip">{{
                  selectedAi
                }}</q-chip>
              </div>
            </div>
          </section>

          <section class="settings-card">
            <header class="card-header">
              <q-icon name="notifications_active" size="20px" />
              <div>
                <div class="card-title">Notification reminders</div>
                <div class="card-caption">
                  Get nudged to follow up on saved jobs.
                </div>
              </div>
            </header>

            <div class="card-body">
              <div class="toggle-row">
                <div>
                  <div class="toggle-label">Enable reminders</div>
                  <div class="toggle-hint">
                    {{
                      settings.remindersEnabled
                        ? "On for all saved jobs"
                        : "Off — no reminders will appear"
                    }}
                  </div>
                </div>
                <q-toggle
                  v-model="settings.remindersEnabled"
                  color="primary"
                  keep-color
                  @update:modelValue="saveSettings"
                />
              </div>

              <div
                class="interval-row"
                :class="{ disabled: !settings.remindersEnabled }"
              >
                <q-input
                  v-model.number="settings.reminderIntervalHours"
                  type="number"
                  label="Interval (hours)"
                  outlined
                  dense
                  dark
                  @blur="saveSettings"
                  class="interval-input"
                  :disable="!settings.remindersEnabled"
                  min="1"
                  max="168"
                />
                <div class="interval-preview">
                  <q-icon name="schedule" size="16px" />
                  <span>{{ intervalPreview }}</span>
                </div>
              </div>
            </div>
          </section>
        </q-tab-panel>

        <!-- PROMPTS -->
        <q-tab-panel name="prompts" class="settings-panel">
          <section class="settings-card">
            <header class="card-header">
              <q-icon name="add_circle" size="20px" />
              <div>
                <div class="card-title">New prompt template</div>
                <div class="card-caption">
                  Reusable snippets for automation workflows.
                </div>
              </div>
            </header>

            <div class="card-body q-gutter-md">
              <q-input
                v-model="promptTitle"
                label="Title"
                outlined
                dense
                dark
              />
              <q-input
                v-model="promptContent"
                type="textarea"
                label="Prompt markdown"
                outlined
                dark
                autogrow
                rows="5"
              />
              <div class="row justify-between items-center">
                <div class="dim char-count">
                  {{ promptContent.length }} characters
                </div>
                <q-btn
                  unelevated
                  no-caps
                  class="save-btn"
                  icon="add"
                  label="Save prompt"
                  @click="savePrompt"
                />
              </div>
            </div>
          </section>

          <div v-if="prompts.length === 0" class="empty-state">
            <q-icon name="notes" size="28px" />
            <div>No prompt templates yet. Add one above to reuse it later.</div>
          </div>

          <div v-else class="prompt-list">
            <div v-for="prompt in prompts" :key="prompt.id" class="prompt-item">
              <div class="prompt-item-main">
                <div class="prompt-item-title">{{ prompt.title }}</div>
                <div class="prompt-item-content">{{ prompt.content }}</div>
              </div>
              <q-btn
                flat
                dense
                round
                icon="delete_outline"
                class="delete-btn"
                @click="deletePrompt(prompt.id)"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- FONTS -->
        <q-tab-panel name="fonts" class="settings-panel">
          <section
            class="settings-card"
            @click="uploadNewFont = true"
            style="cursor: pointer"
          >
            <header class="card-header">
              <q-icon name="upload" size="20px" />
              <div>
                <div class="card-title">Upload a font</div>
                <div class="card-caption">
                  Used in generated resumes and cover letters.
                </div>
              </div>
            </header>
          </section>

          <div v-if="fonts.length === 0" class="empty-state">
            <q-icon name="font_download" size="28px" />
            {{ fonts }}
            <div>
              No fonts uploaded yet. Upload one above to use it in your
              documents.
            </div>
          </div>

          <div v-else class="font-list">
            <div v-for="font in fonts" :key="font" class="font-item">
              <div class="font-preview">Aa</div>
              <div class="font-item-name">
                {{ font }}
                <q-btn
                  :color="settings.defaultFont == 'name' ? 'green' : 'grey'"
                  round
                  dense
                  class="q-ml-md"
                  size="sm"
                  :icon="settings.defaultFont == 'name' ? 'check' : 'circle'"
                  @click="
                    () => {
                      settings.defaultFont = font;
                      saveSettings();
                    }
                  "
                />
              </div>
              <q-btn
                flat
                dense
                round
                icon="delete_outline"
                class="delete-btn"
                @click="deleteFontEntry(font)"
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
  <q-dialog v-model="uploadNewFont" persistent>
    <div class="card-body">
      <UploadFonts>
        <template #top>
          <div class="absolute-top-right">
            <q-btn flat icon="close" v-close-popup />
          </div>
        </template>
      </UploadFonts>
    </div>
  </q-dialog>
  <q-dialog v-model="previewFont.dialog">
    <q-card>
      <q-card-section class="text-center text-subtitle1">
        {{ previewFont.font }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import SelectAiModels from "src/components/SelectAiModels.vue";
import UploadFonts from "src/components/uploadFonts.vue";
import {
  deleteFont,
  deletePromptTemplate,
  getFonts,
  getPromptTemplates,
  getUserSettings,
  savePromptTemplate,
  saveUserSettings,
  type AiProvider,
  type PromptTemplate,
  type UserSettings,
} from "src/db";
import { reactive } from "vue";

const $q = useQuasar();

const activeTab = ref<"general" | "prompts" | "fonts">("general");
const previewFont = reactive({
  dialog: false,
  font: "",
  textSample: "",
});
const selectedAi = ref<AiProvider>("deepseek");
const uploadNewFont = ref(false);
const settings = ref<UserSettings>({
  id: "current",
  defaultAi: "deepseek",
  remindersEnabled: true,
  reminderIntervalHours: 24,
  defaultFont: "Arial",
});
const promptTitle = ref("");
const promptContent = ref("");
const prompts = ref<PromptTemplate[]>([]);
const fonts = ref<string[]>([]);

const intervalPreview = computed(() => {
  const hours = settings.value.reminderIntervalHours;
  if (!settings.value.remindersEnabled) return "Reminders are off";
  if (!hours || hours < 1) return "Enter an interval to see a preview";
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `Next reminder in ${days} day${days > 1 ? "s" : ""}`;
  }
  return `Next reminder in ${hours} hour${hours > 1 ? "s" : ""}`;
});

const loadSettings = async () => {
  const savedSettings = await getUserSettings();
  if (savedSettings) {
    settings.value = savedSettings;
    selectedAi.value = savedSettings.defaultAi;
  }
};

const loadSavedPrompts = async () => {
  prompts.value = await getPromptTemplates();
};

const loadFonts = async () => {
  fonts.value = (await getFonts()).map((v) => v.name);
  console.log(fonts.value);
};

const onAiChange = async (ai: string) => {
  selectedAi.value = ai as AiProvider;
  settings.value.defaultAi = selectedAi.value;
  await saveSettings();
};

const saveSettings = async () => {
  settings.value.id = "current";
  settings.value.defaultAi = selectedAi.value;
  await saveUserSettings(settings.value);
  $q.notify({
    type: "positive",
    message: "Settings saved",
    icon: "check_circle",
  });
};

const savePrompt = async () => {
  if (!promptTitle.value.trim() || !promptContent.value.trim()) {
    $q.notify({
      type: "negative",
      message: "Add both a title and content for the prompt.",
    });
    return;
  }

  const prompt: PromptTemplate = {
    id: `${Date.now()}`,
    title: promptTitle.value.trim(),
    content: promptContent.value.trim(),
    createdAt: new Date().toISOString(),
  };

  await savePromptTemplate(prompt);
  promptTitle.value = "";
  promptContent.value = "";
  await loadSavedPrompts();
  $q.notify({
    type: "positive",
    message: "Prompt saved",
    icon: "check_circle",
  });
};

const deletePrompt = async (id: string) => {
  await deletePromptTemplate(id);
  await loadSavedPrompts();
  $q.notify({
    type: "positive",
    message: "Prompt removed",
    icon: "delete",
  });
};

const deleteFontEntry = async (name: string) => {
  await deleteFont(name);
  await loadFonts();
  $q.notify({
    type: "positive",
    message: `Font ${name} removed`,
    icon: "delete",
  });
};

onMounted(async () => {
  await loadSettings();
  await loadSavedPrompts();
  await loadFonts();
});
</script>

<style scoped>
.settings-page {
  --bg: #0f1115;
  --surface: #1a1d23;
  --surface-2: #22262e;
  --border: #2a2f38;
  --text: #edeef0;
  --text-dim: #9ca3af;
  --accent: #ff6a39;
  --accent-soft: rgba(255, 106, 57, 0.14);
  --danger: #ef4444;

  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  padding: 28px 32px 48px;
  font-family: "Inter", system-ui, sans-serif;
}

/* Header */
.settings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.settings-title {
  font-family: "Manrope", "Inter", system-ui, sans-serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.settings-subtitle {
  color: var(--text-dim);
  font-size: 13.5px;
  margin-top: 4px;
}

.save-btn {
  background: var(--accent) !important;
  color: #14100d !important;
  font-weight: 600;
  border-radius: 8px;
  padding: 0 16px;
}

/* Tabs */
.settings-tabs {
  border-bottom: 1px solid var(--border);
  margin-bottom: 22px;
}

.settings-tabs :deep(.q-tab) {
  color: var(--text-dim);
  min-height: 40px;
  padding: 0 4px;
  margin-right: 22px;
  font-size: 13.5px;
  font-weight: 500;
}

.settings-tabs :deep(.tab-active) {
  color: var(--accent);
}

.settings-tabs :deep(.q-tabs__content) {
  border-bottom: none;
}

.settings-panels {
  background: transparent;
  max-width: 720px;
  width: 100%;
}

.settings-panel {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Cards */
.settings-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  color: var(--accent);
}

.card-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text);
}

.card-caption {
  font-size: 12.5px;
  color: var(--text-dim);
  margin-top: 1px;
}

.card-body {
  padding: 18px;
}

.dim {
  color: var(--text-dim);
  font-size: 12.5px;
}

.char-count {
  font-family: "JetBrains Mono", monospace;
  font-size: 11.5px;
}

/* Provider */
.active-provider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  font-size: 13px;
}

.provider-chip {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
  font-size: 12px;
  text-transform: capitalize;
}

/* Reminders */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
}

.toggle-hint {
  font-size: 12.5px;
  color: var(--text-dim);
  margin-top: 2px;
}

.interval-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  transition: opacity 0.15s ease;
}

.interval-row.disabled {
  opacity: 0.45;
}

.interval-input {
  width: 160px;
}

.interval-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 12.5px;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 6px 10px;
  border-radius: 6px;
}

/* Prompt list */
.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
}

.prompt-item-title {
  font-size: 13.5px;
  font-weight: 600;
}

.prompt-item-content {
  font-size: 12.5px;
  color: var(--text-dim);
  margin-top: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Font list */
.font-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.font-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  position: relative;
}

.font-preview {
  font-size: 26px;
  line-height: 1;
}

.font-item-name {
  font-size: 12px;
  color: var(--text-dim);
  word-break: break-word;
}

.font-item .delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
}

/* Shared */
.delete-btn {
  color: var(--text-dim);
}

.delete-btn:hover {
  color: var(--danger);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-dim);
  font-size: 13px;
  border: 1px dashed var(--border);
  border-radius: 12px;
}

/* Focus visibility */
:deep(.q-field--outlined .q-field__control):focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

@media (max-width: 640px) {
  .settings-page {
    padding: 20px 16px 36px;
  }
  .interval-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
