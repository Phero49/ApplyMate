<template>
  <q-page class="generated-resumes-page q-pa-lg">
    <!-- Page Header -->
    <div class="page-header q-mb-xl">
      <div class="row items-center justify-between">
        <div>
          <h4
            class="text-white q-my-none q-mb-xs"
            style="font-weight: 700; letter-spacing: -0.5px"
          >
            Generated Resumes
          </h4>
          <p class="text-grey-5 q-my-none text-body1">
            {{ resumes.length }} resume{{ resumes.length !== 1 ? "s" : "" }}
            created
          </p>
        </div>
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="New Resume"
          class="new-resume-btn"
          @click="createNewResume"
        />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="row q-col-gutter-lg">
      <div v-for="i in 4" :key="i" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="resume-card-skeleton" flat>
          <q-card-section>
            <q-skeleton
              type="rect"
              height="120px"
              class="q-mb-md"
              style="border-radius: 8px"
            />
            <q-skeleton type="text" width="80%" class="q-mb-sm" />
            <q-skeleton type="text" width="60%" class="q-mb-md" />
            <q-skeleton type="text" width="40%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="resumes.length === 0"
      class="empty-state column items-center justify-center"
    >
      <div class="empty-icon-wrapper q-mb-lg">
        <q-icon name="description" size="64px" color="grey-7" />
      </div>
      <h5 class="text-grey-4 q-my-sm" style="font-weight: 600">
        No resumes yet
      </h5>
      <p
        class="text-grey-6 q-mt-none q-mb-lg text-center"
        style="max-width: 400px"
      >
        Generate tailored resumes from saved job listings to stand out in your
        applications.
      </p>
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Create Your First Resume"
        class="new-resume-btn"
        @click="createNewResume"
      />
    </div>

    <!-- Resume Cards Grid -->
    <div v-else class="row q-col-gutter-lg">
      <div
        v-for="(resume, index) in resumes"
        :key="resume.url"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        :style="{ animationDelay: `${index * 60}ms` }"
      >
        <q-card class="resume-card" flat @click="openResume(resume.url)">
          <!-- Card Top: Document Preview -->
          <div class="card-preview">
            <div class="preview-lines">
              <div class="line line-title"></div>
              <div class="line line-subtitle"></div>
              <div class="line-gap"></div>
              <div class="line line-text"></div>
              <div class="line line-text short"></div>
              <div class="line line-text"></div>
              <div class="line-gap"></div>
              <div class="line line-text"></div>
              <div class="line line-text medium"></div>
              <div class="line line-text short"></div>
            </div>
            <div class="preview-overlay">
              <q-icon name="open_in_new" size="28px" color="white" />
            </div>
          </div>

          <!-- Card Body -->
          <q-card-section class="card-body">
            <div class="headline-text ellipsis-2-lines">
              {{ resume.headline || "Untitled Resume" }}
            </div>

            <div v-if="resume.title" class="title-text ellipsis q-mt-xs">
              {{ resume.title }}
            </div>

            <div class="meta-row q-mt-md">
              <q-icon
                name="schedule"
                size="14px"
                color="grey-6"
                class="q-mr-xs"
              />
              <span class="date-text">{{ formatDate(resume.createdAt) }}</span>
            </div>
          </q-card-section>

          <!-- Card Actions -->
          <q-separator class="card-separator" />
          <q-card-actions class="card-actions">
            <q-btn
              flat
              dense
              icon="edit"
              label="Edit"
              size="sm"
              class="action-btn"
              @click.stop="openResume(resume.url)"
            />
            <q-space />
            <q-btn
              flat
              dense
              icon="delete_outline"
              size="sm"
              class="action-btn-delete"
              @click.stop="confirmDelete(resume)"
            >
              <q-tooltip>Delete resume</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card class="delete-dialog" style="min-width: 360px">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar
            icon="warning"
            color="negative"
            text-color="white"
            size="42px"
          />
          <span class="q-ml-md text-h6 text-white">Delete Resume</span>
        </q-card-section>
        <q-card-section class="text-grey-4">
          Are you sure you want to delete
          <strong class="text-white">"{{ resumeToDelete?.headline }}"</strong>?
          This action cannot be undone.
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-5" v-close-popup />
          <q-btn
            unelevated
            label="Delete"
            color="negative"
            @click="deleteResume"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>

  <q-dialog v-model="writeFirstMessage" persistent>
    <q-card
      flat
      class="rounded-borders"
      bordered
      style="width: 100%; max-width: 500px"
    >
      <div class="text-h6 q-py-md text-center">Tell the AI your thought</div>
      <q-form @submit.prevent="sendMessage">
        <q-card-section class="q-gutter-y-md">
          <q-input
            v-model="firstMessage"
            type="textarea"
            filled
            autogrow
            label="write your first message"
          />
          <div>
            <q-toggle
              v-model="includeProfile"
              label="include your profile data"
              color="green"
            />
          </div>
          <div>
            <q-toggle
              v-model="includePrompt"
              label="attach a prompt"
              color="green"
            />
          </div>
          <div v-if="includePrompt">
            <q-select
              v-model="selectedPrompt"
              :options="['default']"
              label="select prompts"
              filled
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="send message"
            color="primary"
            type="submit"
            v-close-popup
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { getAllGeneratedResumes, initDB } from "src/db";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import type { BexBridge } from "@quasar/app-vite";
import { useGenerateNewAiResume } from "src/composable/generateNewResume";

interface GeneratedResume {
  url: string;
  title: string;
  headline: string;
  createdAt: string;
}

const router = useRouter();
const $q = useQuasar();
const bex = $q.bex as BexBridge;
const {
  writeFirstMessage,
  firstMessage,
  includeProfile,
  includePrompt,
  selectedPrompt,
  createNewResume,
  sendMessage,
} = useGenerateNewAiResume(bex, router);
const resumes = ref<GeneratedResume[]>([]);
const loading = ref(true);
const deleteDialog = ref(false);
const resumeToDelete = ref<GeneratedResume | null>(null);
const deleting = ref(false);

onMounted(async () => {
  try {
    resumes.value = await getAllGeneratedResumes();
  } finally {
    loading.value = false;
  }
});

function openResume(url: string) {
  void router.push({ path: "/app/resume-builder", query: { href: url } });
}

function confirmDelete(resume: GeneratedResume) {
  resumeToDelete.value = resume;
  deleteDialog.value = true;
}

async function deleteResume() {
  if (!resumeToDelete.value) return;
  deleting.value = true;
  try {
    const db = await initDB();
    await db.delete("generatedResumes", resumeToDelete.value.url);
    resumes.value = resumes.value.filter(
      (r) => r.url !== resumeToDelete.value!.url,
    );
    $q.notify({
      type: "positive",
      message: "Resume deleted successfully",
      icon: "check_circle",
      position: "bottom-right",
    });
  } catch {
    $q.notify({
      type: "negative",
      message: "Failed to delete resume",
      icon: "error",
      position: "bottom-right",
    });
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    resumeToDelete.value = null;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
</script>

<style scoped>
.generated-resumes-page {
  min-height: 100vh;
}

/* ---------- Page header ---------- */
.new-resume-btn {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 8px 20px;
}

/* ---------- Resume Card ---------- */
.resume-card {
  background: var(--q-dark);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardFadeIn 0.4s ease both;
  overflow: hidden;
}

.resume-card:hover {
  transform: translateY(-4px);
  border-color: rgba(249, 115, 22, 0.35);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(249, 115, 22, 0.15);
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- Document Preview ---------- */
.card-preview {
  position: relative;
  background: linear-gradient(145deg, #2a2d35, #1e2026);
  padding: 20px 24px;
  min-height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-preview::before {
  content: "";
  position: absolute;
  top: -30%;
  right: -20%;
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle,
    rgba(249, 115, 22, 0.08),
    transparent 70%
  );
  border-radius: 50%;
}

.preview-lines {
  width: 100%;
  max-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: opacity 0.3s ease;
}

.resume-card:hover .preview-lines {
  opacity: 0.3;
}

.line {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.line-title {
  width: 65%;
  height: 6px;
  background: rgba(249, 115, 22, 0.4);
}

.line-subtitle {
  width: 45%;
  height: 4px;
  background: rgba(249, 115, 22, 0.2);
}

.line-text {
  width: 100%;
}

.line-text.short {
  width: 60%;
}

.line-text.medium {
  width: 80%;
}

.line-gap {
  height: 6px;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(249, 115, 22, 0.12);
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}

.resume-card:hover .preview-overlay {
  opacity: 1;
}

/* ---------- Card Body ---------- */
.card-body {
  padding: 16px 20px 12px;
}

.headline-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f0f0f2;
  line-height: 1.4;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.title-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 400;
}

.meta-row {
  display: flex;
  align-items: center;
}

.date-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 500;
}

/* ---------- Card Actions ---------- */
.card-separator {
  background: rgba(255, 255, 255, 0.06);
}

.card-actions {
  padding: 6px 12px;
}

.action-btn {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-size: 0.78rem;
  border-radius: 8px;
  letter-spacing: 0.2px;
}

.action-btn:hover {
  color: var(--q-primary);
  background: rgba(249, 115, 22, 0.1);
}

.action-btn-delete {
  color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.action-btn-delete:hover {
  color: var(--q-negative);
  background: rgba(239, 68, 68, 0.1);
}

/* ---------- Skeleton ---------- */
.resume-card-skeleton {
  background: var(--q-dark);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* ---------- Empty State ---------- */
.empty-state {
  min-height: 50vh;
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---------- Delete Dialog ---------- */
.delete-dialog {
  background: var(--q-dark);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
