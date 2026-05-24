<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Projects
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="q-mb-md" v-for="n in 2" :key="n">
      <ContentItem>
        <div class="row justify-between text-bold q-pa-xs">
          <div>E-commerce Platform</div>
          <div>2022</div>
        </div>
      </ContentItem>
      <ContentItem>
        <div class="text-italic q-pa-xs text-body2 text-grey-8">
          Vue.js, Node.js, MongoDB
        </div>
      </ContentItem>
      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem>
          <li class="q-pa-xs">
            Built a full-stack e-commerce platform handling 10k+ monthly active
            users.
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
