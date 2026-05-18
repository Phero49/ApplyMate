<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Resume Templates</h1>
        <p class="text-subtitle1 text-grey q-mt-sm">Select a template to generate your resume.</p>
      </div>
      <q-btn outline no-caps color="primary" icon="upload_file" label="Import Template" class="border-radius-sm" />
    </div>

    <!-- Templates Grid -->
    <div class="row q-col-gutter-lg">
      <div v-for="template in templates" :key="template.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card bordered flat class="template-card border-outline">
          <div class="template-image-container border-bottom">
            <q-img
              :src="template.image"
              ratio="0.75"
              class="template-img"
              fit="cover"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center text-grey text-body1">
                  Preview Graphic
                </div>
              </template>
            </q-img>
            
            <!-- Hover Overlay -->
            <div class="overlay absolute-full flex flex-center column q-gutter-sm">
              <q-btn unelevated color="primary" no-caps label="Use Template" class="q-px-md" />
              <q-btn flat color="white" no-caps icon="visibility" label="Preview" class="bg-dark q-px-md" style="background: rgba(0,0,0,0.5) !important;" />
            </div>
          </div>

          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-medium text-body1">{{ template.name }}</div>
                <div class="text-caption text-grey">{{ template.category }}</div>
              </div>
              <q-badge v-if="template.isDefault" color="primary" text-color="white" label="Default" class="q-pa-xs border-outline-minimal" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const templates = ref([
  {
    id: 1,
    name: 'Tech Innovator',
    category: 'Minimalist',
    image: 'https://via.placeholder.com/400x533/ffffff/e0e0e0?text=Tech+Innovator',
    isDefault: true
  },
  {
    id: 2,
    name: 'Executive Suite',
    category: 'Professional',
    image: 'https://via.placeholder.com/400x533/ffffff/e0e0e0?text=Executive+Suite',
    isDefault: false
  },
  {
    id: 3,
    name: 'Creative Studio',
    category: 'Modern',
    image: 'https://via.placeholder.com/400x533/ffffff/e0e0e0?text=Creative+Studio',
    isDefault: false
  },
  {
    id: 4,
    name: 'Clean Standard',
    category: 'Traditional',
    image: 'https://via.placeholder.com/400x533/ffffff/e0e0e0?text=Clean+Standard',
    isDefault: false
  }
]);
</script>

<style scoped>
/* Rest uses app.scss */
.border-bottom {
  border-bottom: 1px solid var(--q-dark);
}

.border-outline-minimal {
  border: 1px solid var(--q-dark);
}

.template-card {
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.template-card:hover {
  border-color: var(--q-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
}

.template-image-container {
  position: relative;
  overflow: hidden;
}

.overlay {
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.template-card:hover .overlay {
  opacity: 1;
}

.template-img {
  transition: transform 0.3s ease;
}
.template-card:hover .template-img {
  transform: scale(1.02);
}
</style>
