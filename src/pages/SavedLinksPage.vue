<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md border-bottom q-pb-sm">
      <div>
        <h1 class="text-h5 text-weight-bold q-my-none">Saved Links</h1>
        <p class="text-body2 text-grey q-mt-xs">Job boards and applications you've bookmarked to apply later.</p>
      </div>
      <q-btn outline color="primary" size="sm" no-caps icon="add" label="Add Link" class="border-radius-sm" />
    </div>

    <div class="row">
        <div class="col-12">
            <q-card bordered flat class="border-outline form-card overflow-hidden">
                <q-list separator>
                    <template v-for="link in savedLinks" :key="link.id">
                        <q-item class="q-py-md activity-item">
                            <q-item-section avatar>
                                <q-avatar size="36px" color="primary" text-color="white" :icon="link.icon" rounded class="opacity-80" />
                            </q-item-section>

                            <q-item-section>
                                <q-item-label class="text-weight-medium text-body2">{{ link.title }}</q-item-label>
                                <q-item-label caption class="text-primary cursor-pointer">{{ link.url }}</q-item-label>
                            </q-item-section>

                            <q-item-section side>
                                <div class="row items-center q-gutter-x-sm">
                                    <q-btn unelevated color="primary" size="sm" no-caps label="Fill Application" />
                                    <q-btn flat round color="grey" dense icon="more_vert" />
                                </div>
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
import { ref, onMounted } from 'vue';
import { getSavedLinks, addSavedLink, type SavedLink } from "src/db";

const savedLinks = ref<SavedLink[]>([]);

onMounted(async () => {
  let links = await getSavedLinks();
  
  if (links.length === 0) {
    const sampleLinks = [
      {
        title: 'Frontend Engineer - Google Careers',
        url: 'careers.google.com/jobs/results/1234',
        icon: 'work'
      },
      {
        title: 'Senior Vue Developer - Stripe Workday',
        url: 'stripe.wd1.myworkdayjobs.com/en-US/stripe/job',
        icon: 'domain'
      },
      {
        title: 'React Native Dev - LinkedIn',
        url: 'linkedin.com/jobs/view/45678',
        icon: 'business_center'
      }
    ];
    
    for (const link of sampleLinks) {
      await addSavedLink(link);
    }
    links = await getSavedLinks();
  }
  
  savedLinks.value = links;
});
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--q-dark);
}
</style>
