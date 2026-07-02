<template>
  <div
    class="content-container"
    :style="[
      { cursor: 'pointer' },
      domStore.styles[itemName] as Record<string, any>,
    ]"
    :item-name="itemName"
    :section="section"
    @dblclick="onDoubleClick"
    @click="
      (e) => {
        onClick(e);
        if (items) {
          domStore.additionalMenuitems = items;
        }
      }
    "
    @blur="onBlur"
    @contextmenu="onContextMenu"
    ref="containerRef"
  >
    <slot> </slot>
  </div>
</template>

<script setup lang="ts">
import {
  onBlur,
  onDoubleClick,
  onContextMenu,
  onClick,
  type AdditionalITems,
  useDomStore,
} from "src/stores/dom";
import { ref } from "vue";
const containerRef = ref<HTMLElement>();
const domStore = useDomStore();

withDefaults(
  defineProps<{
    items?: AdditionalITems;
    section?: string;
    itemName: string;
    type?: "text" | "section-container" | "section-header";
  }>(),
  {
    type: "text",
  },
);
</script>

<style scoped></style>
