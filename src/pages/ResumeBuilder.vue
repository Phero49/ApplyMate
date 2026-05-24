<template>
  <q-layout view="hHh LpR fFf">
    <q-header>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          @click="$router.push('/app')"
        />
        <q-toolbar-title>Resume Builder</q-toolbar-title>
        <q-btn
          label="sections"
          flat
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </q-toolbar>
    </q-header>
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left">
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="q-py-md text-subtitle1">Layout</div>
          <div class="row justify-between">
            <q-btn
              dense
              :color="layout == 'vertical' ? 'primary' : 'grey'"
              :icon="biSquare"
              size="md"
              @click="
                () => {
                  layout = 'vertical';
                }
              "
            />
            <q-btn
              dense
              :color="
                layout == 'twoColumn' && columnSide == 'left'
                  ? 'primary'
                  : 'grey'
              "
              @click="
                () => {
                  layout = 'twoColumn';
                  columnSide = 'left';
                }
              "
              :icon="biLayoutSidebar"
              size="md"
            />
            <q-btn
              dense
              :color="
                layout == 'twoColumn' && columnSide == 'right'
                  ? 'primary'
                  : 'grey'
              "
              :icon="biLayoutSidebarReverse"
              size="md"
              @click="
                () => {
                  layout = 'twoColumn';
                  columnSide = 'right';
                }
              "
            />
          </div>
        </div>

        <div class="q-px-md q-mb-lg">
          <div class="q-py-sm text-subtitle1">Styling</div>
          <q-select
            v-model="selectedFont"
            :options="fontOptions"
            label="Font Family"
            dense
            outlined
            class="q-mb-md"
          />
          <q-toggle
            v-model="showSectionLines"
            label="Show Section Lines"
            color="primary"
          />
        </div>

        <format-text />
      </q-scroll-area>
    </q-drawer>
    <q-drawer
      show-if-above
      v-model="rightDrawerOpen"
      bordered
      :width="230"
      flat
      side="right"
    >
      <q-scroll-area class="fit">
        <div
          class="text-center text-grey-5 q-py-md text-subtitle1 text-bold text-uppercase"
        >
          Resume sections
        </div>
        <q-separator />
        <q-list dense>
          <q-item
            class="text-capitalize text-grey"
            v-for="(section, key) in sections"
            :key="key"
            clickable
            v-close-popup
          >
            <q-item-section>
              <q-item-label class="text-subtitle2">{{ key }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-checkbox v-model="sections[key]" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <q-page>
        <div>
          <div class="bg-grey-4 text-black row justify-center">
            <div
              class="bg-white q-pa-lg resume-root"
              style="width: 210mm"
              :style="{ fontFamily: selectedFont }"
            >
              <div v-if="layout == 'vertical'">
                <div v-for="(value, key) in sections" :key="key">
                  <component v-if="value" :is="getComponents(key)"></component>
                </div>
              </div>
              <div v-if="layout == 'twoColumn'">
                <div>
                  <component :is="getComponents('header')"></component
                  ><component :is="getComponents('contact')"></component>
                </div>
                <div
                  class="row"
                  :class="{
                    reverse: layout == 'twoColumn' && columnSide == 'right',
                  }"
                >
                  <div
                    class="col-4"
                    :class="[{ 'offset-1': columnSide == 'right' }]"
                  >
                    <div
                      v-for="value in [
                        'summary',
                        'skills',
                        'awards',
                        'languages',
                        'volunteering',
                        'references',
                      ]"
                      :key="value"
                    >
                      <component
                        v-if="sections[value as keyof typeof sections]"
                        :is="getComponents(value)"
                      ></component>
                    </div>
                  </div>
                  <div
                    class="col-7"
                    :class="[{ 'offset-1': columnSide == 'left' }]"
                  >
                    <div
                      v-for="value in [
                        'experience',
                        'projects',
                        'education',
                        'certifications',
                      ]"
                      :key="value"
                    >
                      <component
                        v-if="sections[value as keyof typeof sections]"
                        :is="getComponents(value)"
                      ></component>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {
  biLayoutSidebar,
  biLayoutSidebarReverse,
  biSquare,
} from "@quasar/extras/bootstrap-icons";
import CertificationsSection from "src/components/resumeBuilder/CertificationsSection.vue";
import ContactSection from "src/components/resumeBuilder/ContactSection.vue";
import EducationSection from "src/components/resumeBuilder/EducationSection.vue";
import ExperienceSection from "src/components/resumeBuilder/experienceSection.vue";
import HeaderSection from "src/components/resumeBuilder/headerSection.vue";
import AwardsSection from "src/components/resumeBuilder/AwardsSection.vue";
import LanguagesSection from "src/components/resumeBuilder/LanguagesSection.vue";
import ProjectsSection from "src/components/resumeBuilder/ProjectsSection.vue";
import VolunteeringSection from "src/components/resumeBuilder/volunteeringSection.vue";
import ReferencesSection from "src/components/resumeBuilder/ReferencesSection.vue";
import SkillsSection from "src/components/resumeBuilder/SkillsSection.vue";
import SummarySection from "src/components/resumeBuilder/summarySection.vue";
import { reactive, ref } from "vue";
import FormatText from "src/components/resumeBuilder/formatText.vue";

//const templates = ref();
const layout = ref<"vertical" | "twoColumn">("vertical");
const columnSide = ref<"left" | "right">("left");

const selectedFont = ref("Roboto");
const fontOptions = [
  "Roboto",
  "Arial",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
  "Helvetica",
  "Trebuchet MS",
];
const showSectionLines = ref(true);
const leftDrawerOpen = ref(true);
const rightDrawerOpen = ref(true);
const getComponents = (key: string) => {
  switch (key) {
    case "header":
      return HeaderSection;
    case "contact":
      return ContactSection;
    case "summary":
      return SummarySection;
    case "experience":
      return ExperienceSection;
    case "education":
      return EducationSection;
    case "skills":
      return SkillsSection;
    case "certifications":
      return CertificationsSection;
    case "projects":
      return ProjectsSection;
    case "awards":
      return AwardsSection;
    case "languages":
      return LanguagesSection;
    case "volunteering":
      return VolunteeringSection;
    case "references":
      return ReferencesSection;
    default:
      return null;
  }
};

const sections = reactive({
  header: true,
  contact: true,
  summary: true,
  experience: true,
  education: true,
  skills: true,
  certifications: false,
  projects: false,
  awards: false,
  languages: true,
  volunteering: false,
  references: false,
});

import { useAppContext } from "src/stores/appStore";
import { onMounted } from "vue";
const store = useAppContext();

onMounted(async () => {
  await store.loadProfile();
});
</script>

<style scoped></style>
