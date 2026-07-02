<template>
  <div class="q-py-sm">
    <ContentItem itemName="projects-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">
        Projects
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div
      class="q-mb-md"
      v-for="(project, i) in appStore.resume.projects"
      :key="i"
    >
      <ContentItem :itemName="'projects.' + i" section="projects">
        <div class="row justify-between text-bold q-pa-xs">
          <ContentItem
            :itemName="'projects.' + i + '.title'"
            section="project-item"
          >
            <div>{{ project.title }}</div>
          </ContentItem>
          <ContentItem
            :itemName="'projects.' + i + '.dates'"
            section="project-item"
          >
            <div>{{ project.dates }}</div>
          </ContentItem>
        </div>
      </ContentItem>

      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem
          v-for="(bullet, j) in project.bullets"
          :key="j"
          :itemName="'projects.' + i + '.bullets.' + j"
          section="project-item"
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
