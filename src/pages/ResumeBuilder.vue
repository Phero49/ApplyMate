<template>
  <q-layout view="hHh LpR fFf">
    <q-header bordered class="bg-white text-black">
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
          icon="undo"
          unelevated
          outline
          color="grey-10"
          @click="domStore.undo()"
          :disable="domStore.undoStack.length === 0"
        >
          <q-tooltip>Undo (Ctrl+Z)</q-tooltip>
        </q-btn>
        <q-separator vertical spaced />

        <q-btn
          icon="redo"
          unelevated
          outline
          color="grey-10"
          @click="domStore.redo()"
          :disable="domStore.redoStack.length === 0"
        >
          <q-tooltip>Redo (Ctrl+Y)</q-tooltip>
        </q-btn>
        <q-separator vertical spaced />
        <q-btn label="Export to PDF" color="black" @click="exportToPDF" />
      </q-toolbar>
    </q-header>
    <q-drawer show-if-above v-model="leftDrawerOpen" :width="340" side="left">
      <q-scroll-area class="fit">
        <resume-builder-editor />
        <!-- <div class="q-pa-md">
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
        </div> -->

        <!-- <format-text /> -->
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <div>
          <div class="bg-grey-4 q-pt-md text-black row justify-center">
            <div
              class="bg-white q-pa-lg resume-root"
              style="width: 210mm"
              :style="{ fontFamily: selectedFont }"
            >
              <div v-if="currentSelectedLayout.name == 'vertical'">
                <div v-for="(value, key) in sections" :key="key">
                  <div></div>
                  <component
                    v-if="value.include"
                    :is="getComponents(key)"
                  ></component>
                </div>
              </div>
              <div v-if="currentSelectedLayout.name == 'two columns'">
                <div>
                  <component :is="getComponents('header')"></component
                  ><component :is="getComponents('contact')"></component>
                </div>
                <div
                  class="row"
                  :class="{
                    reverse: currentSelectedLayout.columnSide == 'right',
                  }"
                >
                  <div
                    class="col-4"
                    :class="[
                      {
                        'offset-1': currentSelectedLayout.name == 'two columns',
                      },
                    ]"
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
                    :class="[
                      {
                        'offset-1': currentSelectedLayout.columnSide == 'left',
                      },
                    ]"
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
import { ref } from "vue";
import { useAppContext } from "src/stores/appStore";
import { onMounted } from "vue";
import ResumeBuilderEditor from "src/components/ResumeBuilderEditor.vue";
import { currentSelectedLayout, sections } from "src/composable/resumeBuilder";
import { useDomStore } from "src/stores/dom";

import { useRoute } from "vue-router";
import { getGeneratedResume } from "src/db";
import { exportPdf } from "../composable/resumeBuilder";
//const templates = ref();
const domStore = useDomStore();
const selectedFont = ref("Roboto");
const appStore = useAppContext();
const leftDrawerOpen = ref(true);
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

const store = useAppContext();
const route = useRoute();
const key = route.query.href;
onMounted(async () => {
  await store.loadProfile();
  if (key) {
    const resumeData = await getGeneratedResume(key as string);
    appStore.resume = resumeData.resume;
  }
});

const exportToPDF = () => {
  exportPdf();
};
</script>

<style scoped></style>
