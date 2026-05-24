<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Awards
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>

    <div class="q-mb-md" v-for="n in 2" :key="n">
      <ContentItem>
        <div class="row justify-between text-bold q-pa-xs">
          <div>Employee of the Year</div>
          <div>2021</div>
        </div>
      </ContentItem>
      
      <ContentItem>
        <div class="text-italic q-pa-xs text-body2">
          Tech Innovations Inc.
        </div>
      </ContentItem>

      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem>
          <li class="q-pa-xs">
            Recognized for outstanding performance and dedication.
          </li>
        </ContentItem>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
</script>

<style scoped></style>
