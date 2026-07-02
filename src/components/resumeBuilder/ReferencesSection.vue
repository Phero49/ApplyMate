<template>
  <div class="q-py-sm">
    <ContentItem type="section-header" itemName="references-header">
      <div
        class="text-subtitle1 text-uppercase text-bold q-pa-xs"
        :style="{ color: domStore.primaryColor }"
      >
        References
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div
      v-if="
        appStore.resume?.references && appStore.resume?.references.length > 0
      "
    >
      <div v-for="(ref, i) in appStore.resume?.references" :key="i" class="q-py-xs">
        <ContentItem
          :itemName="'references.' + i"
          section="references"
          class="row items-center q-gutter-x-xs text-body2"
        >
          <ContentItem :itemName="'references.' + i + '.name'">
            <span class="text-bold">{{ ref.name }}</span>
          </ContentItem>
          <span>-</span>
          <ContentItem :itemName="'references.' + i + '.company'">
            <span class="text-italic">{{ ref.company }}</span>
          </ContentItem>
          <span>-</span>
          <ContentItem :itemName="'references.' + i + '.email'">
            <span>{{ ref.email }}</span>
          </ContentItem>
          <span>-</span>
          <ContentItem :itemName="'references.' + i + '.phone'">
            <span>{{ ref.phone }}</span>
          </ContentItem>
        </ContentItem>
      </div>
    </div>
    <div v-else>
      <ContentItem itemName="reference-placeholder" section="references">
        <div class="q-pa-xs text-body2">Available upon request.</div>
      </ContentItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";
import { useDomStore } from "src/stores/dom";
const appStore = useAppContext();
const domStore = useDomStore();
</script>

<style scoped></style>
