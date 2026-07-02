<template>
  <div class="q-py-sm">
    <ContentItem itemName="languages-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">
        Languages
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="row text-body2" v-if="store.resume?.languages?.length">
    <div class="row text-body2" v-if="store.resume?.languages?.length">
      <div
        class="col-6 row items-center no-wrap"
        v-for="(lang, i) in store.resume.languages"
        :key="i"
      >
        <ContentItem
          :itemName="'languages.' + i + '.name'"
          section="languages-item"
        >
          <div class="q-pa-xs text-bold">{{ lang.name }}:</div>
        </ContentItem>
        <ContentItem
          :itemName="'languages.' + i + '.level'"
          section="languages-item"
        >
          <div class="q-pa-xs">{{ lang.level }}</div>
        </ContentItem>
      </div>
    </div>
    </div>
    <div v-else class="row text-body2">
      <ContentItem class="col-6" itemName="language-empty-placeholder" section="languages">
        <div class="q-pa-xs text-grey-6 italic">
          No languages added in resume.
        </div>
      </ContentItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";

const store = useAppContext();
</script>

<style scoped></style>
