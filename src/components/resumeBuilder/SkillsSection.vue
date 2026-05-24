<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Skills
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="row q-gutter-sm text-body2">
      <ContentItem
        v-for="skill in [
          'JavaScript',
          'Vue.js',
          'React',
          'Node.js',
          'Python',
          'SQL',
          'Git',
          'Agile',
        ]"
        :key="skill"
      >
        <div class="q-pa-xs bg-grey-3 rounded-borders">
          {{ skill }}
        </div>
      </ContentItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
</script>

<style scoped></style>
