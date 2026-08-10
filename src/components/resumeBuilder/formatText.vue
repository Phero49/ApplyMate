<template>
  <div class="row q-gutter-x-md q-ml-md q-mb-md no-wrap"></div>
  <div class="q-pa-xs no-wrap text-white rounded-borders">
    <!-- History -->
    <div class="text-subtitle1 q-mb-sm">Text Formatting</div>
    <!-- basic formatting -->
    <div class="row justify-between no-wrap">
      <q-btn
        icon="bi-type-bold"
        dense
        flat
        size="sm"
        @click="applyStyle('fontWeight', 'bold')"
      />
      <q-btn
        icon="bi-type-italic"
        dense
        flat
        size="sm"
        @click="applyStyle('fontStyle', 'italic')"
      />
      <q-btn
        icon="bi-type-underline"
        dense
        flat
        size="sm"
        @click="applyStyle('textDecoration', 'underline')"
      />
    </div>
    <q-separator spaced />
    <!-- alignment -->
    <!-- <div class="text-subtitle1 q-mt-md">Alignment</div>
    <div class="row justify-between no-wrap">
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
    </div> -->
    <div class="q-my-md">
      <q-select
        v-model="appStore.selectedFont"
        type="text"
        label="fonts"
        dense
        :options="appStore.resumeFonts.map((v) => v.name)"
        stack-label
        filled
      >
        <template v-slot:after>
          <q-btn dense icon="upload" flat @click.stop="dialog = true">
            <q-tooltip>Upload font</q-tooltip>
          </q-btn>
        </template>
      </q-select>
    </div>
    <div>
      <q-select
        v-model="fontSize"
        use-input
        label="font size"
        suffix="px"
        @update:model-value="
          (v) => {
            applyStyle('fontSize', v + 'px');
          }
        "
        @input-value="
          (v) => {
            if (v) applyStyle('fontSize', v + 'px');
          }
        "
        dense
        hide-selected
        fill-input
        filled
        :options="fontSizes"
      />
    </div>
    <div>
      <div class="text-subtitle1 q-mt-md">Colors</div>
      <div class="row q-mt-md justify-between">
        <!-- text color -->
        <q-btn
          icon="bi-palette"
          label="text color"
          dense
          flat
          no-caps
          :style="{ color: textColor }"
        >
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
        <q-btn
          icon="bi-paint-bucket"
          label="background color"
          dense
          flat
          :style="{ backgroundColor: bgColor }"
          no-caps
        >
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
      </div>
    </div>
  </div>

  <q-separator spaced />
  <div>
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
  <q-dialog v-model="dialog">
    <div>
      <UploadFonts />
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { applyStyle, useDomStore } from "src/stores/dom";
import { watch } from "vue";
import UploadFonts from "src/components/uploadFonts.vue";
import { useAppContext } from "src/stores/appStore";

const appStore = useAppContext();
const dialog = ref(false);
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
      textColor.value = getComputedStyle(el).color;
      bgColor.value = getComputedStyle(el).backgroundColor;
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
