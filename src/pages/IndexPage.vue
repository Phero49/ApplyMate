<template>
  <q-card style="width: 400px; height: 500px">
    <q-toolbar class="bg-primary">
      <q-toolbar-title>ApplyMate</q-toolbar-title>
    </q-toolbar>
    <q-card-section>
      <q-btn
        class="full-width bg-secondary"
        label="Dashboard"
        @click="openExtension('/app/dashboard')"
      />
      <q-separator />
      <div class="text-center text-subtitle1 q-py-md">Select Default AI</div>
      <select-ai-models @update:modelValue="onAiChange" />

      <q-separator spaced class="q-my-md" />

      <q-list separator class="text-capitalize">
        <q-item
          clickable
          v-ripple
          @click="action.action"
          v-for="action in actions"
          :key="action.title"
        >
          <q-item-section avatar>
            <q-icon color="primary" :name="action.icon" />
          </q-item-section>
          <q-item-section>{{ action.title }}</q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {
  symRoundedBookmarkAdd,
  symRoundedContractEdit,
  symRoundedInboxText,
} from "@quasar/extras/material-symbols-rounded";
import { useQuasar } from "quasar";
import type { UserSettings } from "src/db";
import {
  addSavedLink,
  getProfile,
  getUserSettings,
  saveUserSettings,
  type AiProvider,
} from "src/db";

import { onMounted, ref } from "vue";
import { type BexBridge } from "@quasar/app-vite";
import SelectAiModels from "src/components/SelectAiModels.vue";

const $q = useQuasar();
const bex = $q.bex as BexBridge;
const openExtension = (page: string) => {
  void bex.send({ event: "openExtension", payload: page, to: "background" });
};
const defaultAI = ref("deepseek");

let savedSettings: UserSettings | undefined;
onMounted(async () => {
  savedSettings = await getUserSettings();
  if (savedSettings?.defaultAi) {
    defaultAI.value = savedSettings.defaultAi;
  }
});

const onAiChange = async (value: string) => {
  defaultAI.value = value;
  if (savedSettings == undefined) {
    return;
  }
  await saveUserSettings({
    ...savedSettings,
    id: "current",
    defaultAi: value as AiProvider,
  });
};

const actions = [
  {
    icon: symRoundedContractEdit,
    title: "generate resume",
    description: "generate resume from your profile",
    action: () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      getJobDetails(async (jobDetails) => {
        console.log(jobDetails);
        const profile = await getProfile();
        void bex.send({
          event: "generate-resume",
          to: "background",
          payload: {
            jobDescription: jobDetails.jobDetails,
            url: jobDetails.url,
            title: jobDetails.title,
            resumeData: JSON.stringify(profile),
            ai: defaultAI.value,
          },
        });
      });
    },
  },
  {
    icon: symRoundedInboxText,
    title: "generate cover letter",
    description: "generate cover letter",
    action: () => {},
  },
  {
    icon: symRoundedBookmarkAdd,
    title: "save link",
    description: "save link there will be no notifications about saved links",
    action: async () => {
      try {
        const tab = await bex.send({
          event: "getCurrentOpenedTab",
          to: "background",
        });
        if (tab == undefined) {
          console.log("failed to get tab");
          return;
        }
        await addSavedLink({
          icon: tab.favIconUrl,
          title: tab.title,
          url: tab.url,
        });
        $q.notify({ message: "link saved", type: "positive" });
      } catch (e) {
        console.error("error", e);
        $q.notify({ message: "error failed to save link", type: "negative" });
      }
    },
  },
  {
    icon: "notifications",
    title: "save job",
    description:
      "save job you be notified with reminders based on the job closing date",
    action: async () => {
      const body = await bex.send({
        event: "getCurrentDocumentBodyText",
        to: "background",
      });

      await bex.send({
        event: "extract-job-details",
        to: "background",
        payload: {
          platform: defaultAI.value,
          window: body.window,
          prompt: `
         extract details from description descriptions as   a json
        on the sumary be a little creative so that one can understand the job post without
        needing to read the full description you can include things the user should take note
        for new lines be explicit by using   \n newline escape also do not include emojis formatting 
        you can use markdown for the summary
         ***structure***
         \`\`\` json
            {
          title:string,
           publishedDate:string //js supported dates
          closeDate:string , //js supported dates
          company:string,
          jobSummary:string,
          applicationMode: string[] //'postal mail' | 'email' | 'external website' | 'unknown'
          }
       \`\`\`

       ***job details****
       ${body.data.textContent}

         `,
        },
      });
      console.log();
      //fetch close date
    },
  },
  {
    icon: "edit",
    title: "autofill",
    description: "autofill job application forms",
    action: async () => {
      const form = await bex.send({
        event: "getFormMappings",
        to: "background",
        payload: {
          ai: defaultAI.value,
        },
      });
      console.log(form);
    },
  },
];

function getJobDetails(
  onSuccess: (data: { jobDetails: string; url: string; title: string }) => void,
) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) {
      return;
    }
    chrome.tabs.sendMessage(tab.id!, { type: "getJobDetails" }, (response) => {
      console.log(response, "response");
      if (response) {
        onSuccess(response);
      } else {
        $q.notify({
          message: "error failed to get job details",
          type: "negative",
        });
      }
    });
  });
}
</script>

<style scoped></style>
