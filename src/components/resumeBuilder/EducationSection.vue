<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Education
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="q-mb-md">
      <ContentItem>
        <div class="row justify-between text-bold q-pa-xs">
          <div>Bachelor of Science in Computer Science</div>
          <div>Aug 2015 - May 2019</div>
        </div>
      </ContentItem>
      <ContentItem>
        <div class="row justify-between text-italic q-pa-xs">
          <div>University of Technology</div>
          <div>New York, NY</div>
        </div>
      </ContentItem>
      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem>
          <li class="q-pa-xs">Graduated with Honors. GPA: 3.8/4.0</li>
        </ContentItem>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
</script>

<style scoped></style>
