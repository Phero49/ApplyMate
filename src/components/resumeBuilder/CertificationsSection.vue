<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Certifications
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="q-mb-md">
      <ContentItem>
        <div class="row justify-between text-bold q-pa-xs">
          <div>AWS Certified Solutions Architect</div>
          <div>2023</div>
        </div>
      </ContentItem>
      <ContentItem>
        <div class="row justify-between text-bold q-pa-xs">
          <div>Certified ScrumMaster (CSM)</div>
          <div>2020</div>
        </div>
      </ContentItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
</script>

<style scoped></style>
