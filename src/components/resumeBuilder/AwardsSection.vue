<template>
  <div class="q-py-sm">
    <ContentItem itemName="awards-header">
      <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">Awards</div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>

    <div
      class="q-mb-md"
      v-for="(n, i) in appStore.resume.awards || []"
      :key="i"
    >
      <ContentItem :itemName="'awards.' + i" section="awards">
        <div class="row justify-between text-bold q-pa-xs">
          <ContentItem
            :itemName="'awards.' + i + '.name'"
            section="awards-item"
          >
            <div>{{ n.name }}</div>
          </ContentItem>
          <ContentItem
            :itemName="'awards.' + i + '.date'"
            section="awards-item"
          >
            <div>{{ n.date }}</div>
          </ContentItem>
        </div>
      </ContentItem>

      <ContentItem :itemName="'awards.' + i + '.issuer'" section="awards-item">
        <div class="text-italic q-pa-xs text-body2">
          {{ n.issuer }}
        </div>
      </ContentItem>

      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem
          v-for="(bullet, j) in n.description"
          :key="j"
          :itemName="'awards.' + i + '.bullets.' + j"
          section="awards-item"
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
