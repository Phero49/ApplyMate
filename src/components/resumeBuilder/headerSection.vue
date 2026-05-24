<template>
  <div class="header q-py-md" section="header">
    <ContentItem>
      <div class="name text-primary text-uppercase q-pa-xs">
        {{ name }}
      </div>
    </ContentItem>

    <ContentItem>
      <div class="subtitle text-grey-8 text-weight-medium q-pa-xs text-uppercase letter-spacing-1">
        {{ title }}
      </div>
    </ContentItem>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ContentItem from "./ContentItem.vue";

const name = ref("JOHN DOE");
const title = ref("SOFTWARE ENGINEER");
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
