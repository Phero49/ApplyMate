<template>
  <div
    class="content-container"
    style="cursor: pointer"
    @dblclick="onDoubleClick"
    @click="
      (e) => {
        onClick(e);
        if (items) {
          useDomStore().additionalMenuitems = items;
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
defineProps<{ items?: AdditionalITems; section?: string }>();
</script>

<style scoped></style>
