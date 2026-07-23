<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md border-bottom q-pb-sm">
      <div>
        <div class="text-h5 text-weight-bold q-my-none">Saved jobs</div>
        <p class="text-body2 text-grey q-mt-xs">
          job links you saved you will get notified about saved jobs every hour
        </p>
      </div>
    </div>

    <q-list class="q-gutter-y-md">
      <q-expansion-item v-for="(job, i) in savedJobs" :key="i" expand-separator>
        <template #header>
          <div class="row items-center full-width">
            <div>
              <q-icon size="md" :name="'img:' + job.icon" />
            </div>
            <div class="q-pl-lg col-grow">
              <div class="text-subtile2">
                {{ job.title }}
              </div>
              <div class="text-grey text-caption row">
                Employer: {{ job.company }}
                <q-separator spaced vertical /> closed Date :
                {{
                  new Date(job.closeDate).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) || "-"
                }}

                <q-separator spaced vertical />

                saved on :
                {{
                  new Date(job.savedAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) || "-"
                }}
                <q-separator spaced vertical />

                <q-badge
                  v-if="
                    job.applied == false && new Date(job.closeDate) > new Date()
                  "
                  color="green-7"
                  floating
                  text-color="white"
                  label="not applied"
                />
                <q-badge
                  v-else-if="
                    job.applied == true && new Date(job.closeDate) > new Date()
                  "
                  color="green-5"
                  floating
                  text-color="white"
                  label="applied"
                />
                <q-badge
                  v-else-if="new Date(job.closeDate) < new Date()"
                  color="red-5"
                  floating
                  text-color="white"
                  label="missed"
                />
              </div>
            </div>
          </div>
        </template>
        <q-item class="activity-item bg-grey-10">
          <q-item-section>
            <div>
              <count-down-timer
                label="time left to apply"
                :targetDate="
                  new Date(
                    (job.closeDate ?? '').replace(/(\d+)(st|nd|rd|th)/, '$1'),
                  )
                "
              />
            </div>

            <q-item-label class="text-grey-4 text-body2">
              <q-separator spaced />
              <div v-parse-text="job.summary"></div>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <div class="row items-center q-gutter-x-sm">
              <span class="q-ml-sm text-uppercase"
                ><q-checkbox
                  left-label
                  v-model="job.applied"
                  @update:model-value="() => markAsApplied(job)"
                  label="applied"
              /></span>
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
      </q-expansion-item>
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

function markAsApplied(job: SavedJob) {
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
