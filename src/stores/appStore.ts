/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { getProfile, type UserProfile, getStats, type Stats } from "src/db";
export interface Resume {
  name: string;
  headline: string;
  contact: Array<{ label: string; value: string }>;
  summary: string;
  skills: Array<{ category: string; skillList: string[] }>;
  experience: Array<{
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  projects?: Array<{
    title: string;
    dates?: string;
    bullets: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    dates?: string;
    bullets?: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  awards?: Array<{
    name: string;
    issuer: string;
    date?: string;
    description?: string[];
  }>;
  volunteering?: Array<{
    title: string;
    organization: string;
    role: string;
    dates: string;
    bullets: string[];
  }>;
  languages?: Array<{ name: string; level: string }>;
  references?: Array<{
    relationship: string;
    name: string;
    company: string;
  contact:string
  }>;
}

export const useAppContext = defineStore("appContext", {
  state: () => ({
    profile: undefined as UserProfile | undefined,
    resume: {} as Resume,
    aiChatUrl: "",
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
