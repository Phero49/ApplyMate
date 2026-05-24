<template>
  <div class="row q-gutter-x-md q-ml-md q-mb-md no-wrap">
    <q-btn
      icon="undo"
      dense
      label="undo"
      flat
      size="sm"
      @click="domStore.undo()"
      :disable="domStore.undoStack.length === 0"
    >
      <q-tooltip>Undo (Ctrl+Z)</q-tooltip>
    </q-btn>
    <q-btn
      icon="redo"
      dense
      label="redo"
      flat
      size="sm"
      @click="domStore.redo()"
      :disable="domStore.redoStack.length === 0"
    >
      <q-tooltip>Redo (Ctrl+Y)</q-tooltip>
    </q-btn>
  </div>
  <div class="q-pa-xs row items-center no-wrap text-white rounded-borders">
    <!-- History -->

    <!-- basic formatting -->
    <div class="row no-wrap">
      <q-btn
        icon="bi-type-bold"
        dense
        flat
        size="sm"
        @click="applyCommand('bold')"
      />
      <q-btn
        icon="bi-type-italic"
        dense
        flat
        size="sm"
        @click="applyCommand('italic')"
      />
      <q-btn
        icon="bi-type-underline"
        dense
        flat
        size="sm"
        @click="applyCommand('underline')"
      />
    </div>

    <q-separator vertical class="q-mx-xs" />

    <!-- alignment -->
    <div class="row no-wrap">
      <q-btn
        icon="bi-text-left"
        dense
        flat
        size="sm"
        @click="applyStyle('textAlign', 'left')"
      />
      <q-btn
        icon="bi-text-center"
        dense
        flat
        size="sm"
        @click="applyStyle('textAlign', 'center')"
      />
      <q-btn
        icon="bi-text-right"
        dense
        flat
        size="sm"
        @click="applyStyle('textAlign', 'right')"
      />
      <q-btn
        icon="bi-justify"
        dense
        flat
        size="sm"
        @click="applyStyle('textAlign', 'justify')"
      />
    </div>

    <q-separator vertical class="q-mx-xs" />

    <!-- font -->
    <q-btn icon="bi-fonts" dense flat size="sm">
      <q-menu anchor="bottom left" self="top left">
        <q-list dense style="min-width: 150px">
          <q-item
            v-for="font in fontOptions"
            :key="font"
            clickable
            v-close-popup
            @click="applyStyle('fontFamily', font)"
          >
            <q-item-section :style="{ fontFamily: font }">{{
              font
            }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <!-- text color -->
    <q-btn icon="bi-palette" dense flat size="sm" color="primary">
      <q-menu>
        <q-color
          v-model="textColor"
          @update:model-value="applyStyle('color', textColor)"
          no-header
          no-footer
          class="my-picker"
        />
      </q-menu>
    </q-btn>

    <!-- background color -->
    <q-btn icon="bi-paint-bucket" dense flat size="sm">
      <q-menu>
        <q-color
          v-model="bgColor"
          @update:model-value="applyStyle('backgroundColor', bgColor)"
          no-header
          no-footer
          class="my-picker"
        />
      </q-menu>
    </q-btn>
    <!-- font size -->

    <!-- boldness weight -->
    <q-btn icon="bi-type-h1" dense flat size="sm">
      <q-menu>
        <q-list dense style="min-width: 100px">
          <q-item
            v-for="weight in [100, 200, 300, 400, 500, 600, 700, 800, 900]"
            :key="weight"
            clickable
            v-close-popup
            @click="applyStyle('fontWeight', weight.toString())"
          >
            <q-item-section :style="{ fontWeight: weight }">{{
              weight
            }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
  <q-separator spaced />
  <div>
    <q-item>
      <q-item-section avatar>
        <q-avatar color="primary" size="sm" text-color="white" icon="bi-type" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Font size</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-select
          style="width: 60px"
          v-model="fontSize"
          use-input
          suffix="px"
          @input-value="
            (v) => {
              applyStyle('font-size', v + 'px');
            }
          "
          dense
          hide-selected
          fill-input
          :options="fontSizes"
        />
      </q-item-section>
    </q-item>
    <q-item clickable @click="domStore.removeSelected">
      <q-item-section avatar>
        <q-avatar color="red" size="sm" text-color="white" icon="delete" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Remove Selected</q-item-label>
      </q-item-section>
    </q-item>

    <div v-if="domStore.additionalMenuitems.layout == 'column'">
      <q-item v-for="(item, i) in domStore.additionalMenuitems.items" :key="i">
        <q-item-section top avatar>
          <q-avatar
            v-if="item.icon"
            color="primary"
            text-color="white"
            :icon="item.icon"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label v-if="item.ui == 'checkbox'"> </q-item-label>
          <q-icon name="star" color="yellow" />
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { applyStyle, applyCommand, useDomStore } from "src/stores/dom";
import { watch } from "vue";

const textColor = ref("#000000");
const bgColor = ref("#ffffff");
defineProps<{ additionalInfo?: boolean; isMenu?: boolean }>();
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
const domStore = useDomStore();
const fontSize = ref();
const fontSizes = ref([8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]);

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "z") {
      if (e.shiftKey) {
        domStore.redo();
      } else {
        domStore.undo();
      }
      e.preventDefault();
    } else if (e.key === "y") {
      domStore.redo();
      e.preventDefault();
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

watch(
  () => domStore.selectedElement,
  (el) => {
    if (el) {
      fontSize.value = getComputedStyle(el).fontSize;
    } else {
      domStore.additionalMenuitems = { layout: "column", items: [] };
    }
  },
);
</script>

<style scoped>
.my-picker {
  width: 200px;
}
</style>
