import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", component: () => import("pages/IndexPage.vue") },
  {
    path: "/app",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "dashboard", component: () => import("pages/Dashboard.vue") },
      { path: "templates", component: () => import("pages/TemplatesPage.vue") },
      { path: "profile", component: () => import("pages/profilePage.vue") },
      {
        path: "saved-links",
        component: () => import("pages/SavedLinksPage.vue"),
      },
      {
        path: "notifications",
        component: () => import("pages/NotificationsPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
