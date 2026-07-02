<template>
  <div class="q-py-sm">
    <ContentItem itemName="summary-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">
        Professional Summary
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>

    <ContentItem itemName="summary" section="summary">
      <div class="q-pa-xs text-body2">
        {{ appStore.resume.summary }}
      </div>
    </ContentItem>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";
const appStore = useAppContext();
</script>

<style scoped></style>
