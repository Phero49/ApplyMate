<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md border-bottom q-pb-sm">
      <div>
        <h1 class="text-h5 text-weight-bold q-my-none">Saved Links</h1>
        <p class="text-body2 text-grey q-mt-xs">
           website links you bookmarked
        </p>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <q-card bordered flat class="border-outline form-card overflow-hidden">
          <q-list separator>
            <template v-for="(link, i) in savedLinks" :key="link.id">
              <q-item class="q-py-md activity-item">
                <q-item-section avatar>
                  <q-avatar
                    size="36px"
                    color="primary"
                    text-color="white"
                    rounded
                    class="opacity-80"
                  >
                    <img :src="link.icon" alt="" srcset="" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium text-body2">{{
                    link.title
                  }}</q-item-label>
                  <q-item-label caption class="text-primary cursor-pointer">{{
                    link.url
                  }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <q-btn
                      flat
                      round
                      color="grey"
                      @click="deleteLink(link.id, i)"
                      dense
                      icon="close"
                    />
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
import { ref, onMounted } from "vue";
import { deleteSavedLink, getSavedLinks, type SavedLink } from "src/db";
import { useQuasar } from "quasar";

const savedLinks = ref<SavedLink[]>([]);

onMounted(async () => {
  savedLinks.value = await getSavedLinks();
});
const $q = useQuasar();
async function deleteLink(id: number, index: number) {
  try {
    await deleteSavedLink(id);
    savedLinks.value.splice(index, 1);
    $q.notify({ message: "link removed", type: "positive" });
  } catch (e) {
    console.error("failed to delete :", e);
    $q.notify({ message: "failed to delete link", type: "negative" });
  }
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--q-dark);
}
</style>
