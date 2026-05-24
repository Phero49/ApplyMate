<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Languages
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="row text-body2" v-if="store.profile?.language.length">
      <ContentItem
        class="col-6"
        v-for="(lang, i) in store.profile.language"
        :key="i"
      >
        <div class="q-pa-xs">
          <strong>{{ lang.name }}:</strong> {{ lang.level }}
        </div>
      </ContentItem>
    </div>
    <div v-else class="row text-body2">
      <ContentItem class="col-6">
        <div class="q-pa-xs text-grey-6 italic">No languages added in profile.</div>
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
