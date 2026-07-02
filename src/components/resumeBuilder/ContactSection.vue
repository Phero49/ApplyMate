<template>
  <ContentItem itemName="contact-header">
    <div class="text-subtitle1 text-uppercase text-bold q-pa-xs">Contact</div>
    <q-separator class="bg-primary" style="height: 2px" />
  </ContentItem>

  <ContentItem itemName="contact" class="q-py-sm" section="contact">
    <q-menu context-menu anchor="bottom middle">
      <q-list style="min-width: 100px">
        <q-item clickable @click="toogleIncludeLabels" v-close-popup>
          <q-item-section class="text-capitalize"
            >include labels</q-item-section
          >
          <q-item-section side>
            <q-checkbox
              v-model="includeLabels"
              @update:model-value="toogleIncludeLabels"
            />
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup>
          <q-item-section class="text-capitalize"
            >inline display</q-item-section
          >
          <q-item-section side>
            <q-checkbox
              v-model="display"
              true-value="inline"
              false-value="block"
              @update:model-value="toogleDisplay"
            />
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section class="text-capitalize">alignment</q-item-section>
          <q-item-section side>
            <q-icon name="arrow_drop_down" />
          </q-item-section>
          <q-menu>
            <q-list separator style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                @click="
                  domStore.putObjectStyle('contact', { alignment: value })
                "
                :key="value"
                v-for="value in ['left', 'right', 'center']"
              >
                <q-item-section>{{ value }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </q-menu>
    <div
      :class="{
        'inline-display': display === 'inline',
        'block-display': display === 'block',
        'row justify-start': alignment === 'left',
        'row justify-center': alignment === 'center',
        'row justify-end': alignment === 'right',
      }"
    >
      <div v-for="(value, i) in contacts" :key="i">
        <ContentItem item-name="contact.email" section="contact-item">
          <div class="q-pa-sm first-letter-capitalize text-subtitle2">
            <span>
              <span v-if="includeLabels">{{ value.label }}:</span>
              {{ value.value || "---" }}
            </span>
          </div>
        </ContentItem>
      </div>
    </div>
  </ContentItem>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ContentItem from "./ContentItem.vue";
import { useAppContext } from "src/stores/appStore";
import { useDomStore } from "src/stores/dom";

const contacts = useAppContext().resume.contact;
const domStore = useDomStore();

const includeLabels = computed(
  () => !!domStore.styles["contact"]?.includeLabels,
);
const alignment = computed(() => domStore.styles["contact"]?.alignment);
const display = computed(() => domStore.styles["contact"]?.display || "inline");

function toogleDisplay(value: string) {
  domStore.putObjectStyle("contact", {
    ...domStore.styles["contact"],
    display: value,
  });
}
function toogleIncludeLabels() {
  domStore.putObjectStyle("contact", {
    ...domStore.styles["contact"],
    includeLabels: !includeLabels.value,
  });
}
</script>

<style scoped>
.inline-display {
  display: flex;
  flex-wrap: wrap;
}

.block-display {
  display: block;
}
</style>
