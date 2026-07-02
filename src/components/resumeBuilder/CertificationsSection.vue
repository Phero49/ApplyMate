<template>
  <div class="q-py-sm">
    <ContentItem itemName="certifications-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">
        Certifications
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div
      class="q-mb-md"
      v-for="(cert, i) in appStore.resume.certifications"
      :key="i"
    >
      <ContentItem :itemName="'certifications.' + i" section="certifications">
        <div class="row justify-between text-bold q-pa-xs">
          <ContentItem
            :itemName="'certifications.' + i + '.name'"
            section="certification-item"
          >
            <div>{{ cert.name }}</div>
          </ContentItem>
          <ContentItem
            :itemName="'certifications.' + i + '.date'"
            section="certification-item"
          >
            <div>{{ cert.date }}</div>
          </ContentItem>
        </div>
      </ContentItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";
const appStore = useAppContext();
</script>

<style scoped></style>
