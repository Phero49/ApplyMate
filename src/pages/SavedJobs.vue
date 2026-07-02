<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md border-bottom q-pb-sm">
      <div>
        <h1 class="text-h5 text-weight-bold q-my-none">Saved jobs</h1>
        <p class="text-body2 text-grey q-mt-xs">
          job links you saved you will get notified about saved jobs every hour
        </p>
      </div>
    </div>

    <q-list class="q-gutter-y-md">
      <q-item
        v-for="(job, i) in savedJobs"
        :key="i"
        class="activity-item bg-grey-10"
      >
        <q-item-section avatar top>
          <q-avatar
            size="46px"
            color="primary"
            text-color="white"
            rounded
            class="opacity-80"
          >
            <img :src="job.icon" alt="" srcset="" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-primary text-h6">{{
            job.title
          }}</q-item-label>

          <q-item-label class="text-subtitle2 text-grey-5 q-mt-sm">
            Employer: {{ job.company }}</q-item-label
          >
          <q-item-label class="q-mt-sm">
            <q-chip square size="sm" color="negative">
              closed Date :
              {{
                new Date(job.closeDate).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }) || "-"
              }}
            </q-chip>
            <q-chip square size="sm" color="grey-8">
              saved on :
              {{
                new Date(job.savedAt).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }) || "-"
              }}
            </q-chip>
            <q-checkbox
              v-model="job.applied"
              @update:model-value="markAsApplied(job, $event)"
              label="Applied"
            />
          </q-item-label>
          <q-item-label class="text-grey-4 text-body2">
            <q-separator spaced />
            <div v-parse-text="job.summary"></div>
          </q-item-label>
          <div class="q-mt-sm">
            <div class="text-subtitle2 text-grey">Time left</div>
            <count-down-timer
              :targetDate="
                new Date(
                  (job.closeDate ?? '').replace(/(\d+)(st|nd|rd|th)/, '$1'),
                )
              "
            />
          </div>
        </q-item-section>

        <q-item-section side top>
          <div class="row items-center q-gutter-x-sm">
            <q-btn
              color="primary"
              icon="open_in_new"
              dense
              unelevated
              @click="openLink(job.url)"
            >
              <q-tooltip> view job link </q-tooltip>
            </q-btn>
            <q-btn
              color="red"
              @click="deleteLink(job.url, i)"
              unelevated
              dense
              icon="close"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from "vue";
import {
  deleteSavedJob,
  getSavedJobs,
  type SavedJob,
  addSavedJob,
} from "src/db";
import { useQuasar } from "quasar";

const savedJobs = ref<SavedJob[]>([]);

onMounted(async () => {
  savedJobs.value = await getSavedJobs();
});
import { marked } from "marked";
import CountDownTimer from "src/components/countDownTimer.vue";

const vParseText = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mounted(el: HTMLElement, binding: any) {
    const markdownText = binding.value;

    if (!markdownText) {
      el.innerHTML = "";
      return;
    }

    // Parse markdown to HTML
    const parsedHtml = marked.parse(markdownText);

    // Handle both sync and async marked versions
    if (parsedHtml instanceof Promise) {
      parsedHtml
        .then((html) => {
          el.innerHTML = html;
        })
        .catch((err) => {
          console.error("Markdown parsing error:", err);
          el.innerHTML = '<p style="color: red;">Error parsing markdown</p>';
        });
    } else {
      el.innerHTML = parsedHtml;
    }
  },
};

const $q = useQuasar();
async function deleteLink(url: string, index: number) {
  try {
    await deleteSavedJob(url);
    savedJobs.value.splice(index, 1);
    $q.notify({ message: "job removed", type: "positive" });
  } catch (e) {
    console.error("failed to delete :", e);
    $q.notify({ message: "failed to delete job", type: "negative" });
  }
}
function openLink(url: string) {
  window.open(url, "_blank");
}

function markAsApplied(job: SavedJob, v: boolean) {
  job.applied = v;
  void addSavedJob(toRaw(job));
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--q-dark);
}
/* Normalize all headings to look like regular text */
h1,
h2,
h3,
h4,
h5,
h6 {
  /* Reset font properties */
  font-size: 1rem;
  font-weight: normal;

  /* Reset margin and padding */
  margin: 0;
  padding: 0;

  /* Reset line height */
  line-height: normal;

  /* Reset other heading-specific styles */
  display: block;

  /* Optional: remove any default heading styling */
  text-decoration: none;
  font-style: normal;
  font-variant: normal;
}
</style>
