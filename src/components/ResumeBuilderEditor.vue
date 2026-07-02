<template>
  <div>
    <q-tabs dense no-caps v-model="tab" align="center">
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
      <q-tab-panel name="contents">
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
              <q-checkbox v-model="sections[key].include" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
      <q-tab-panel name="layout">
        <q-list bordered>
          <q-item
            clickable
            v-ripple
            v-for="layout in availableLayouts"
            :key="layout.name"
            @click="currentSelectedLayout = layout"
          >
            <q-item-section avatar>
              <q-icon color="primary" :name="layout.icon" />
            </q-item-section>
            <q-item-section>{{
              layout.name + " " + (layout.columnSide || "")
            }}</q-item-section>
            <q-item-section side>
              <q-radio v-model="currentSelectedLayout" :val="layout" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
      <q-tab-panel name="format">
        <format-text />
      </q-tab-panel>
      <q-tab-panel name="AI" class="q-pa-none">
        <resume-chat />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { symRoundedGridLayoutSide } from "@quasar/extras/material-symbols-rounded";
import {
  availableLayouts,
  currentSelectedLayout,
  sections,
} from "src/composable/resumeBuilder";
import FormatText from "./resumeBuilder/formatText.vue";
import ResumeChat from "./ResumeChat.vue";
import { useDomStore } from "src/stores/dom";
import { watch } from "vue";
const tab = ref("contents");
const domStore = useDomStore();
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
    icon: "edit_note",
    label: "contents",
  },
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

<style scoped></style>
