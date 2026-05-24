import { defineStore } from "pinia";
import { getProfile, type UserProfile } from "src/db";

export const useAppContext = defineStore("appContext", {
  state: () => ({
    profile: undefined as UserProfile | undefined,
  }),

  getters: {},

  actions: {
    async loadProfile() {
      this.profile = await getProfile();
    },
  },
});
