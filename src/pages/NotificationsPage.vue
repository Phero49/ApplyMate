<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md border-bottom q-pb-sm">
      <div>
        <h1 class="text-h5 text-weight-bold q-my-none">Notifications</h1>
        <p class="text-body2 text-grey q-mt-xs">Updates, alerts, and notifications about your applications.</p>
      </div>
      <q-btn outline color="primary" size="sm" no-caps label="Mark all exact" class="border-radius-sm" />
    </div>

    <div class="row">
      <div class="col-12">
        <q-card bordered flat class="border-outline form-card overflow-hidden">
          <q-list separator>
            <template v-for="notif in notifications" :key="notif.id">
              <q-item class="q-py-md activity-item">
                <q-item-section avatar>
                  <q-icon :name="notif.icon" :color="notif.color" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium text-body1">
                    {{ notif.title }}
                  </q-item-label>
                  <q-item-label caption class="text-body2 q-mt-xs">
                    {{ notif.message }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-item-label caption>{{ notif.time }}</q-item-label>
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
import { getNotifications, addNotification, type AppNotification } from "src/db";

const notifications = ref<AppNotification[]>([]);

onMounted(async () => {
  let notes = await getNotifications();
  
  if (notes.length === 0) {
    const sampleNotes = [
      {
        title: 'Extension Updated',
        message: 'ApplyMate has been updated to v1.2.0 with improved Workday parsing and faster resume generation.',
        icon: 'system_update',
        color: 'positive',
        time: '2h ago'
      },
      {
        title: 'Resume Template Added',
        message: 'Check out the new "Executive Slate" template in your gallery. Perfect for senior management applications.',
        icon: 'new_releases',
        color: 'warning',
        time: 'Yesterday'
      },
      {
        title: 'Form Parsing Error',
        message: 'We had some trouble parsing the greenhouse form at stripe.com. Manual input may be required.',
        icon: 'error_outline',
        color: 'negative',
        time: '2 days ago'
      }
    ];
    
    for (const note of sampleNotes) {
      await addNotification(note);
    }
    notes = await getNotifications();
  }
  
  notifications.value = notes.reverse();
});
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--q-dark);
}
</style>
