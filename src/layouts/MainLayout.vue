<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>ApplyMate</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EssentialLink, {
  type EssentialLinkProps,
} from "components/EssentialLink.vue";

const linksList: EssentialLinkProps[] = [
  {
    title: "Dashboard",
    caption: "Overview & Statistics",
    icon: "dashboard",
    link: "/app",
  },
  {
    title: "Notifications",
    caption: "Alerts & updates",
    icon: "notifications",
    link: "/app/notifications",
  },
  {
    title: "Saved Links",
    caption: "Your bookmarked jobs",
    icon: "bookmarks",
    link: "/app/saved-links",
  },
  {
    title: "Templates",
    caption: "Browse Resume Templates",
    icon: "description",
    link: "/app/templates",
  },
  {
    title: "Profile",
    caption: "Manage your details",
    icon: "person",
    link: "/app/profile",
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
