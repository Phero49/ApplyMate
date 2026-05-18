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
      <div class="">
        <div class="row justify-between">
          <div class="row">
            <div
              style="width: 50px; height: 50px; cursor: pointer"
              @click="defaultAI = 'chatgpt'"
            >
              <q-img :src="chatgptIcon">
                <div class="absolute-full flex flex-center">
                  <q-icon
                    v-if="defaultAI === 'chatgpt'"
                    :name="symRoundedCheckCircle"
                    color="red"
                    size="30px"
                  />
                </div>
              </q-img>
            </div>
          </div>
          <div
            style="width: 50px; height: 50px; cursor: pointer"
            @click="defaultAI = 'deepseek'"
          >
            <q-img :src="deepseekIcon">
              <div class="absolute-full flex flex-center">
                <q-icon
                  v-if="defaultAI === 'deepseek'"
                  :name="symRoundedCheckCircle"
                  color="primary"
                  size="24px"
                />
              </div>
            </q-img>
          </div>
          <div
            style="width: 50px; height: 50px; cursor: pointer"
            @click="defaultAI = 'gemini'"
          >
            <q-img :src="geminiIcon">
              <div class="absolute-full flex flex-center">
                <q-icon
                  v-if="defaultAI === 'gemini'"
                  :name="symRoundedCheckCircle"
                  color="primary"
                  size="24px"
                />
              </div>
            </q-img>
          </div>
          <div
            style="width: 50px; height: 50px; cursor: pointer"
            @click="defaultAI = 'qwen'"
          >
            <q-img :src="qwenIcon">
              <div class="absolute-full flex flex-center">
                <q-icon
                  v-if="defaultAI === 'qwen'"
                  :name="symRoundedCheckCircle"
                  color="primary"
                  size="24px"
                />
              </div>
            </q-img>
          </div>
        </div>
      </div>
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
  symRoundedCheckCircle,
  symRoundedContractEdit,
  symRoundedInboxText,
} from "@quasar/extras/material-symbols-rounded";
import { useQuasar } from "quasar";
import { addSavedJob, addSavedLink, getProfile } from "src/db";
import chatgptIcon from "../assets/chatgpt-icon.svg";
import deepseekIcon from "../assets/deepseek-logo-icon.svg";
import geminiIcon from "../assets/google-gemini-icon.svg";
import qwenIcon from "../assets/qwen-ai-icon.svg";
import { onMounted, ref } from "vue";
const $q = useQuasar();
const bex = $q.bex;
const openExtension = (page: string) => {
  bex.send({ event: "openExtension", payload: page, to: "background" });
};
const defaultAI = ref("chatgpt");
const actions = [
  {
    icon: symRoundedContractEdit,
    title: "generate resume",
    description: "generate resume from your profile",
    action: () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      getJobDetails(async (jobDetails) => {
        const profile = await getProfile();
        console.log(profile);
        bex.send({
          event: "generate-resume",
          to: "background",
          payload: {
            jobDescription: jobDetails,
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
      const tab = await bex.send({
        event: "getCurrentOpenedTab",
        to: "background",
      });
      await addSavedLink({
        icon: tab.favIconUrl,
        title: tab.title,
        url: tab.url,
      });
    },
  },
  {
    icon: "notifications",
    title: "save job",
    description:
      "save job you be notified with reminders based on the job closing date",
    action: async () => {
      const tab = await bex.send({
        event: "getCurrentOpenedTab",
        to: "background",
      });
      //fetch close date
      await addSavedJob({
        icon: tab.favIconUrl,
        title: tab.title,
        url: tab.url,
        closeDate: "",
        savedAt: new Date().toISOString(),
      });
    },
  },
  {
    icon: "edit",
    title: "autofill",
    description: "autofill job application forms",
    action: () => {},
  },
];

function getJobDetails(onSuccess: (jobDetails: string) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    console.log(tab);
    void chrome.tabs.sendMessage(
      tab.id!,
      { event: "getJobDetails" },
      (response) => {
        onSuccess(response.jobDetails);
      },
    );
  });
}
</script>

<style scoped></style>
