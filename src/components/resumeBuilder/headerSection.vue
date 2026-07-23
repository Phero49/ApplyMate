<template>
  <ContentItem type="section-container" itemName="header" section="header">
    <div class="header q-py-md">
      <ContentItem itemName="name" section="header-item">
        <div class="name text-uppercase q-pa-xs">
          {{ resume.name }}
        </div>
      </ContentItem>

      <ContentItem itemName="headline" section="header-item">
        <div
          class="subtitle text-grey-8 text-weight-medium q-pa-xs text-uppercase letter-spacing-1"
        >
          {{ resume.headline }}
        </div>
      </ContentItem>
    </div>
  </ContentItem>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";

const resume = computed(() => useAppContext().resume);
</script>

<style scoped>
.name {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
}
.subtitle {
  font-size: 14px;
  letter-spacing: 2px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
</style>
