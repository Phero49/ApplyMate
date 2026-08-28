/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { getProfile, type UserProfile, getStats, type Stats } from "src/db";

export type Resume = any;

export const useAppContext = defineStore("appContext", {
  state: () => ({
    profile: undefined as UserProfile | undefined,
    resume: null as FlexibleResume | null,
    aiChatUrl: "",
    resumeFonts: [] as FontsList,
    selectedFont: "",
    //used in saving updates of the resume
    resumeData: null as any,
    stats: undefined as Stats | undefined,
  }),

  getters: {},

  actions: {
    async loadProfile() {
      this.profile = await getProfile();
    },
    async loadStats() {
      this.stats = await getStats();
    },
  },
});
