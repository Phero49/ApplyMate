<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col-12">
        <h1 class="text-h5 text-weight-bold q-my-none">Dashboard</h1>
        <p class="text-body2 text-grey q-mt-xs">
          Monitor your automated job applications.
        </p>
      </div>
    </div>

    <!-- Analytics Section -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Autofilled Applications Card -->
      <div class="col-12 col-md-6">
        <q-card bordered flat class="stat-card border-outline">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-avatar
                size="36px"
                color="primary-light"
                text-color="primary"
                icon="auto_awesome"
                class="q-mr-sm q-pa-xs"
                rounded
              />
              <div class="text-body1 text-weight-medium">
                Applications Autofilled
              </div>
            </div>
            <div class="text-h4 text-weight-bold">128</div>
            <div class="text-caption text-positive q-mt-xs">
              <q-icon name="trending_up" /> +14 this week
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Resumes Generated Card -->
      <div class="col-12 col-md-6">
        <q-card bordered flat class="stat-card border-outline">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-avatar
                size="36px"
                class="bg-accent-light text-accent q-mr-sm q-pa-xs"
                icon="description"
                rounded
              />
              <div class="text-body1 text-weight-medium">Resumes Generated</div>
            </div>
            <div class="text-h4 text-weight-bold">12</div>
            <div class="text-caption text-grey q-mt-xs">
              Custom PDFs created
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Recent Activity List -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-sm">
          <h2 class="text-subtitle1 text-weight-bold q-my-none">
            Recent Activity
          </h2>
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            label="View all history"
            size="sm"
          />
        </div>

        <q-card bordered flat class="border-outline border-radius-sm">
          <q-list separator>
            <template v-for="activity in recentActivities" :key="activity.id">
              <q-item class="q-py-sm activity-item">
                <q-item-section avatar>
                  <q-avatar
                    :icon="activity.icon"
                    :text-color="activity.iconColor"
                    rounded
                    font-size="18px"
                    size="32px"
                    class="bg-primary-light"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium text-body2">
                    {{ activity.title }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ activity.description }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-item-label caption>
                    {{ activity.time }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getActivities, addActivity, type ApplicationActivity } from "src/db";

const recentActivities = ref<ApplicationActivity[]>([]);

onMounted(async () => {
  let activities = await getActivities();

  if (activities.length === 0) {
    // Seed sample data
    const sampleData = [
      {
        title: "Autofilled Workday Application",
        description: "Software Engineer role at Google",
        time: "2 hours ago",
        icon: "auto_awesome",
        iconBg: "primary-light",
        iconColor: "primary",
      },
      {
        title: "Generated Custom Resume",
        description: 'Using "Modern Tech" template for Frontend role',
        time: "Yesterday",
        icon: "picture_as_pdf",
        iconBg: "primary-light",
        iconColor: "primary",
      },
      {
        title: "Autofilled Greenhouse Form",
        description: "Product Manager role at Stripe",
        time: "2 days ago",
        icon: "auto_awesome",
        iconBg: "primary-light",
        iconColor: "primary",
      },
    ];

    for (const item of sampleData) {
      await addActivity(item);
    }
    activities = await getActivities();
  }

  recentActivities.value = activities.reverse(); // Newest first
});
</script>

<style scoped></style>
