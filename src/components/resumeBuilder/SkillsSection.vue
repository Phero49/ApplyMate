<template>
  <div class="q-py-sm">
    <ContentItem itemName="skills-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">Skills</div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="q-py-sm">
      <div v-for="(skillGroup, i) in appStore.resume.skills" :key="i" class="q-mb-xs">
        <ContentItem :itemName="'skills.' + i + '.category'" section="skills-header">
           <div class="text-bold text-caption text-uppercase q-pa-xs">{{ skillGroup.category }}</div>
        </ContentItem>
        <div class="row q-gutter-xs text-body2">
          <ContentItem
            v-for="(skill, j) in skillGroup.skillList"
            :key="j"
            :itemName="'skills.' + i + '.skillList.' + j"
            section="skills"
          >
            <div class="q-pa-xs bg-grey-2 rounded-borders">
              {{ skill }}
            </div>
          </ContentItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";
const appStore = useAppContext();
</script>

<style scoped></style>
