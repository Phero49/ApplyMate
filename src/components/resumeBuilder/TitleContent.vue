<template>
  <div class="title-content">
    <ContentItem>
      <slot></slot>
    </ContentItem>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
</script>

<style scoped>
.title-content {
  font-weight: bold;
  text-transform: uppercase;
}
</style>
