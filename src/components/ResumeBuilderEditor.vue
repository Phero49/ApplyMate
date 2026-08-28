<template>
  <div>
    <q-tabs
      class="bg-blue-grey-10"
      active-bg-color="grey-9"
      dense
      active-class="active-class"
      no-caps
      shrink
      indicator-color="transparent"
      v-model="tab"
      align="center"
    >
      <q-tab
        v-for="(item, key) in mainNav"
        :name="item.label"
        :key="key"
        :icon="item.icon"
        :label="item.label"
        shrink
      />
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="layout">
        <q-list v-if="appStore.resume" >
          <q-item
            clickable
            v-ripple
            v-for="layout in availableLayouts"
            :key="layout.name"
            @click="appStore.resume!.layout = layout.name"
          >
            <q-item-section avatar>
              <q-icon color="primary" :name="layout.icon" />
            </q-item-section>
            <q-item-section>{{
              layout.name + " " + (layout.columnSide || "")
            }}</q-item-section>
            <q-item-section side>
              <q-radio v-model="appStore.resume!.layout" :val="layout.name" />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else>No resume generated yet to select layout</div>
      </q-tab-panel>
      <q-tab-panel name="format">
        <format-text />
      </q-tab-panel>
      <q-tab-panel name="AI" class="q-pa-none q-pr-lg">
        <resume-chat />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { symRoundedGridLayoutSide } from "@quasar/extras/material-symbols-rounded";
import { availableLayouts } from "src/composable/resumeBuilder";
import FormatText from "./resumeBuilder/formatText.vue";
import ResumeChat from "./ResumeChat.vue";
import { useDomStore } from "src/stores/dom";
import { watch } from "vue";
import { useAppContext } from "src/stores/appStore.js";
const tab = ref("AI");
const domStore = useDomStore();
const appStore = useAppContext();

watch(
  () => domStore.selectedElement,
  (el) => {
    if (el != null && tab.value != "format") {
      tab.value = "format";
    }
  },
);
const mainNav = [
  {
    icon: symRoundedGridLayoutSide,
    label: "layout",
  },
  {
    icon: "text_format",
    label: "format",
  },
  {
    icon: "auto_awesome",
    label: "AI",
  },
];
</script>

<style>
.active-class {
  border-radius: 15px;
  margin: 5px;
}
/* For code blocks */
pre,
code {
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
}

/* For tables */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}
</style>
