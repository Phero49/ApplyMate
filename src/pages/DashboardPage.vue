<template>
  <q-page class="q-pa-lg">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-auto">
        <h1 class="text-h4 text-weight-bold q-my-none text-primary">
          Dashboard
        </h1>
        <p class="text-subtitle1 text-grey-7 q-mt-xs text-weight-light">
          Your job search at a glance.
        </p>
      </div>
    </div>

    <!-- Productivity Cards Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Applied Jobs -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap justify-between">
              <div>
                <div
                  class="text-caption text-uppercase text-weight-bold text-grey-6 tracking-widest"
                >
                  Applied Jobs
                </div>
                <div class="text-h5 text-weight-bold text-primary q-mt-xs">
                  {{ appStore.stats?.appliedJobs ?? 0 }}
                </div>
              </div>
              <q-icon
                name="send"
                size="32px"
                color="primary"
                class="opacity-4"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              {{ calculateSuccessRate }}% completion rate
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Saved Jobs -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap justify-between">
              <div>
                <div
                  class="text-caption text-uppercase text-weight-bold text-grey-6 tracking-widest"
                >
                  Saved Jobs
                </div>
                <div class="text-h5 text-weight-bold text-secondary q-mt-xs">
                  {{ appStore.stats?.savedJobs ?? 0 }}
                </div>
              </div>
              <q-icon
                name="bookmark"
                size="32px"
                color="secondary"
                class="opacity-4"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Total jobs bookmarked
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Unapplied Jobs -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap justify-between">
              <div>
                <div
                  class="text-caption text-uppercase text-weight-bold text-grey-6 tracking-widest"
                >
                  Unapplied Jobs
                </div>
                <div class="text-h5 text-weight-bold text-warning q-mt-xs">
                  {{ appStore.stats?.unappliedJobs ?? 0 }}
                </div>
              </div>
              <q-icon
                name="pending_actions"
                size="32px"
                color="warning"
                class="opacity-4"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Still waiting to apply
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Generated Resumes -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap justify-between">
              <div>
                <div
                  class="text-caption text-uppercase text-weight-bold text-grey-6 tracking-widest"
                >
                  Generated Resumes
                </div>
                <div class="text-h5 text-weight-bold text-accent q-mt-xs">
                  {{ appStore.stats?.generatedResumes ?? 0 }}
                </div>
              </div>
              <q-icon
                name="description"
                size="32px"
                color="accent"
                class="opacity-4"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">Resumes created</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Saved Links -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap justify-between">
              <div>
                <div
                  class="text-caption text-uppercase text-weight-bold text-grey-6 tracking-widest"
                >
                  Saved Links
                </div>
                <div class="text-h5 text-weight-bold text-info q-mt-xs">
                  {{ appStore.stats?.savedLinks ?? 0 }}
                </div>
              </div>
              <q-icon name="link" size="32px" color="info" class="opacity-4" />
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Bookmarked resources
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Filled Forms -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap justify-between">
              <div>
                <div
                  class="text-caption text-uppercase text-weight-bold text-grey-6 tracking-widest"
                >
                  Filled Forms
                </div>
                <div class="text-h5 text-weight-bold text-positive q-mt-xs">
                  {{ appStore.stats?.filledForms ?? 0 }}
                </div>
              </div>
              <q-icon
                name="assignment_turned_in"
                size="32px"
                color="positive"
                class="opacity-4"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">Forms autofilled</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useAppContext } from "src/stores/appStore";

const appStore = useAppContext();

const calculateSuccessRate = computed(() => {
  if (!appStore.stats || appStore.stats.savedJobs === 0) return 0;
  return Math.round(
    (appStore.stats.appliedJobs / appStore.stats.savedJobs) * 100,
  );
});

onMounted(async () => {
  await appStore.loadStats();
});
</script>

<style scoped lang="scss">
.tracking-widest {
  letter-spacing: 0.1em;
}

.opacity-4 {
  opacity: 0.4;
}
</style>
