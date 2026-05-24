<template>
  <div class="q-py-sm" section="contact">
    <ContentItem>
      <div class="text-subtitle1 text-uppercase text-bold text-primary q-pa-xs">
        Contact
      </div>
      <q-separator class="bg-primary" style="height: 2px" />
    </ContentItem>
    <div class="text-body2 row" v-if="store.profile">
      <ContentItem section="contact-item">
        <div class="q-pa-xs">
          <q-icon name="bi-envelope" class="q-mr-sm" />
          {{ store.profile.contact.email || "email@example.com" }}
        </div>
      </ContentItem>
      <ContentItem section="contact-item">
        <div class="q-pa-xs">
          <q-icon name="bi-telephone" class="q-mr-sm" />
          {{ store.profile.contact.phone || "+1 (555) 000-0000" }}
        </div>
      </ContentItem>
      <ContentItem section="contact-item" v-if="store.profile.contact.linkedin">
        <div class="q-pa-xs">
          <q-icon name="bi-linkedin" class="q-mr-sm" />
          {{ store.profile.contact.linkedin || "linkedin.com/in/user" }}
        </div>
      </ContentItem>
      <ContentItem section="contact-item" v-if="store.profile.contact.github">
        <div class="q-pa-xs">
          <q-icon name="bi-github" class="q-mr-sm" />
          {{ store.profile.contact.github || "github.com/user" }}
        </div>
      </ContentItem>
      <ContentItem section="contact-item">
        <div class="q-pa-xs">
          <q-icon name="bi-geo-alt" class="q-mr-sm" />
          {{ store.profile.contact.location || "Location, Country" }}
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
