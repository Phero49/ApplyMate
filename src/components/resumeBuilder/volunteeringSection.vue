<template>
  <div class="q-py-sm">
    <ContentItem itemName="volunteering-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">
        Volunteering
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>

    <div
      class="q-mb-md"
      v-for="(n, i) in appStore.resume.volunteering"
      :key="i"
    >
      <ContentItem :itemName="'volunteering.' + i" section="volunteering">
        <div class="row justify-between text-bold q-pa-xs">
          <ContentItem
            :itemName="'volunteering.' + i + '.title'"
            section="volunteering-item"
          >
            <div>{{ n.title }}</div>
          </ContentItem>
          <ContentItem
            :itemName="'volunteering.' + i + '.dates'"
            section="volunteering-item"
          >
            <div>{{ n.dates }}</div>
          </ContentItem>
        </div>
      </ContentItem>
      <ContentItem
        :itemName="'volunteering.' + i + '.organization'"
        section="volunteering-item"
      >
        <div class="text-italic q-pa-xs text-body2">
          {{ n.organization }}
        </div>
      </ContentItem>
      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem
          v-for="(bullet, j) in n.bullets"
          :key="j"
          :itemName="'volunteering.' + i + '.bullets.' + j"
          section="volunteering-item"
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
