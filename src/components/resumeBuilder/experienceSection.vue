<template>
  <div class="q-py-sm">
    <ContentItem itemName="experience-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">
        Experience
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>

    <div
      class="q-mb-md"
      v-for="(exp, i) in appStore.resume.experience"
      :key="i"
    >
      <ContentItem :itemName="'experience.' + i" section="experience">
        <div class="row justify-between text-bold q-pa-xs">
          <ContentItem
            :itemName="'experience.' + i + '.title'"
            section="experience-item"
          >
            <div>{{ exp.title }}</div>
          </ContentItem>
          <ContentItem
            :itemName="'experience.' + i + '.dates'"
            section="experience-item"
          >
            <div>{{ exp.dates }}</div>
          </ContentItem>
        </div>
      </ContentItem>

      <ContentItem
        :itemName="'experience.' + i + '.company'"
        section="experience-item"
      >
        <div class="row justify-between text-italic q-pa-xs">
          <div>{{ exp.company }}</div>
        </div>
      </ContentItem>

      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem
          v-for="(bullet, j) in exp.bullets"
          :key="j"
          :itemName="'experience.' + i + '.bullets.' + j"
          section="experience-item"
        >
          <li class="q-pa-xs">
            {{ bullet }}
          </li>
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
