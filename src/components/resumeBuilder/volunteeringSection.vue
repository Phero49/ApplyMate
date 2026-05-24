<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Volunteering
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>

    <div class="q-mb-md" v-for="n in 2" :key="n">
      <ContentItem>
        <div class="row justify-between text-bold q-pa-xs">
          <div>Community Mentor</div>
          <div>2018 - 2020</div>
        </div>
      </ContentItem>
      
      <ContentItem>
        <div class="text-italic q-pa-xs text-body2">
          Local Tech Youth Program, San Francisco, CA
        </div>
      </ContentItem>

      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem>
          <li class="q-pa-xs">
            Mentored high school students in introductory programming and web design.
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
