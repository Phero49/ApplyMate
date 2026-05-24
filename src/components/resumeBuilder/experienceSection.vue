<template>
  <div class="q-py-sm">
    <ContentItem>
      <div
        class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs"
      >
        Experience
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>

    <div class="q-mb-md" v-for="n in 2" :key="n">
      <ContentItem>
        <div class="row justify-between text-bold q-pa-xs">
          <div>Senior Software Engineer</div>
          <div>Jan 2020 - Present</div>
        </div>
      </ContentItem>

      <ContentItem>
        <div class="row justify-between text-italic q-pa-xs">
          <div>Tech Innovations Inc.</div>
          <div>San Francisco, CA</div>
        </div>
      </ContentItem>

      <ul class="q-pl-lg q-mt-xs q-mb-none text-body2">
        <ContentItem>
          <li class="q-pa-xs">
            Lead the development of multiple scalable web applications using
            Vue.js and Node.js.
          </li>
        </ContentItem>
        <ContentItem>
          <li class="q-pa-xs">
            Mentored junior developers and improved team productivity by 20%.
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
