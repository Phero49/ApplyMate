import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", component: () => import("pages/IndexPage.vue") },
  {
    path: "/app/resume-builder",
    component: () => import("pages/ResumeBuilder.vue"),
  },

  {
    path: "/app",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/app/templates",
        component: () => import("pages/GeneratedResumes.vue"),
      },
      { path: "dashboard", component: () => import("pages/DashboardPage.vue") },
      { path: "profile", component: () => import("pages/profilePage.vue") },
      {
        path: "saved-links",
        component: () => import("pages/SavedLinksPage.vue"),
      },
      {
        path: "saved-jobs",
        component: () => import("pages/SavedJobs.vue"),
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
