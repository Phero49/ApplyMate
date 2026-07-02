<template>
  <div class="q-py-sm">
    <ContentItem itemName="education-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">
        Education
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="q-mb-md" v-for="(edu, i) in appStore.resume.education" :key="i">
      <ContentItem :itemName="'education.' + i" section="education">
        <div class="row justify-between text-bold q-pa-xs">
          <ContentItem
            :itemName="'education.' + i + '.degree'"
            section="education-item"
          >
            <div>{{ edu.degree }}</div>
          </ContentItem>
          <ContentItem
            :itemName="'education.' + i + '.dates'"
            section="education-item"
          >
            <div>{{ edu.dates }}</div>
          </ContentItem>
        </div>
      </ContentItem>
      <ContentItem
        :itemName="'education.' + i + '.institution'"
        section="education-item"
      >
        <div class="row justify-between text-italic q-pa-xs">
          <div>{{ edu.institution }}</div>
        </div>
      </ContentItem>
      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem
          v-for="(bullet, j) in edu.bullets"
          :key="j"
          :itemName="'education.' + i + '.bullets.' + j"
          section="education-item"
        >
          <li class="q-pa-xs">{{ bullet }}</li>
        </ContentItem>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";
const appStore = useAppContext();
</script>

<style scoped></style>
