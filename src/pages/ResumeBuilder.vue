<template>
  <q-layout view="hHh LpR fFf">
    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-btn flat dense round icon="arrow_back" @click="$router.back()" />
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
      <q-scroll-area style="overflow-x: hidden" class="fit q-pr-md">
        <resume-builder-editor />
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <div>
          <div class="bg-grey-4 q-pt-md text-black row justify-center">
            <div
              v-if="resume && Object.keys(resume).length > 0"
              class="bg-white q-pa-lg resume-root"
              style="width: 210mm"
              :style="{ fontFamily: appStore.selectedFont }"
            >
              <div>
                <div section="head" class="">
                  <div
                    field="resume.head.name"
                    contenteditable
                    :style="resume.head.nameStyle"
                  >
                    {{ resume.head.name }}
                  </div>
                  <div
                    contenteditable
                    field="resume.head.headline"
                    :style="resume.head.headlineStyle"
                  >
                    {{ resume.head.headline }}
                  </div>

                  <div class="row" field="resume.head.contact">
                    <div
                      class="q-pr-md"
                      v-for="value in resume.head.contact"
                      :key="value.label"
                      contenteditable
                      :field="'resume.head.contact.' + value.label"
                    >
                      {{
                        resume.head.includeContactLabel ? value.label + ":" : ""
                      }}
                      {{ value.value }}
                    </div>
                  </div>
                </div>
                <q-splitter
                  v-model="splitterModel"
                  :separator-class="{
                    'q-px-md': resume.layout == 'two-column',
                  }"
                  style="height: 100%"
                  :limits="[0, Infinity]"
                >
                  <template v-slot:before>
                    <resume-body
                      :styles="resume.style"
                      :resumeBody="mapSides(resume.body).side"
                    />
                  </template>

                  <template v-slot:after>
                    <resume-body
                      :styles="resume.style"
                      :resumeBody="mapSides(resume.body).main"
                    />
                  </template>
                </q-splitter>
              </div>
            </div>
            <div
              v-else
              class="bg-grey-3 q-pa-lg resume-root"
              style="
                width: 210mm;
                height: calc(100vh - 67px);
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <div class="text-center text-h6">No resume generated yet</div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAppContext } from "src/stores/appStore";
import { onMounted } from "vue";
import ResumeBuilderEditor from "src/components/ResumeBuilderEditor.vue";
//import { currentSelectedLayout, sections } from "src/composable/resumeBuilder";
import { useDomStore } from "src/stores/dom";

import { useRoute } from "vue-router";
import {
  getFontData,
  getFonts,
  getGeneratedResume,
  getUserSettings,
} from "src/db";
import { exportPdf } from "../composable/resumeBuilder";
import { computed } from "vue";
import ResumeBody from "src/components/ResumeBody.vue";
//const templates = ref();
const domStore = useDomStore();
const resume = computed(() => useAppContext().resume);
const appStore = useAppContext();
const leftDrawerOpen = ref(true);
const initSplit = computed(() => (resume.value.layout == "vertical" ? 0 : 35));
const splitterModel = ref(initSplit);
const mapSides = (body: FlexibleResume["body"]) => {
  if (resume.value.layout == "vertical") return { main: body, side: [] };
  const main = [] as FlexibleResume["body"];
  const side = [] as FlexibleResume["body"];
  body.forEach((v) => {
    if (v.side == "side") {
      side.push(v);
    } else {
      main.push(v);
    }
  });
  return {
    main,
    side,
  };
};
const store = useAppContext();
const route = useRoute();
const key = route.query.href;
const fontBlobLink = ref<string[]>([]);
const setSelectedFont = async (font: FontsList[0]) => {
  // Store all font-loading promises to await them concurrently
  const loadPromises: Promise<FontFace>[] = [];
  fontBlobLink.value.forEach((v) => {
    URL.revokeObjectURL(v);
  });

  for (const key in font.fontUrl) {
    const urlString = font.fontUrl[key as keyof FontsList[0]["fontUrl"]];
    if (!urlString) continue;

    const urlObj = new URL(urlString);
    const fontId = urlObj.pathname.split("/").pop();
    const fontName = urlObj.searchParams.get("font-family");

    const fontBlob = await getFontData(fontName || "", fontId || "");
    if (fontBlob == null) continue;

    // Use a standard camelCase name variable
    const fontBlobUrl = URL.createObjectURL(fontBlob);
    fontBlobLink.value.push(fontBlobUrl);
    // Correctly extract traits from the key
    const weight = key.includes("bold") ? "bold" : "normal";
    const style = key.includes("italic") ? "italic" : "normal";

    // 1. Create the Face, passing your computed style variable
    const fontFace = new FontFace(font.name, `url(${fontBlobUrl})`, {
      style,
      weight,
    });

    // 2. Call load() and push the promise to our tracker array
    const loadPromise = fontFace.load().then((loadedFace) => {
      // 3. Register the loaded font face into the document
      document.fonts.add(loadedFace);
      return loadedFace;
    });

    loadPromises.push(loadPromise);
  }

  // Await all variations (regular, bold, italic) to complete loading
  try {
    await Promise.all(loadPromises);
    console.log(`Successfully loaded all available weights for: ${font.name}`);
  } catch (error) {
    console.error(`Error loading font variants for ${font.name}:`, error);
  }
};

onMounted(async () => {
  await store.loadProfile();
  if (key) {
    const resumeData = await getGeneratedResume(key as string);
    const fonts = await getFonts();
    const userSettings = await getUserSettings();
    appStore.resumeFonts = fonts;
    appStore.selectedFont =
      userSettings?.defaultFont || fonts[0]?.name || "Arial";
    const dFont = appStore.resumeFonts.find(
      (v) => v.name == appStore.selectedFont,
    );
    if (dFont != undefined) {
      void setSelectedFont(dFont);
    }
    // appStore.resume = resumeData.resume == "" ? {} : resumeData.resume;
    appStore.resumeData = resumeData;
    appStore.aiChatUrl = resumeData.chatUrl;
  }
});

const exportToPDF = () => {
  void exportPdf();
};
</script>

<style scoped></style>
