<template>
  <div class="">
    <div class="row justify-between">
      <!-- ChatGPT -->
      <q-avatar
        v-for="(value, i) in platformIcons"
        :key="i"
        size="50px"
        color="white"
        text-color="white"
        :icon="'img:' + value.icon"
        class="cursor-pointer"
        @click="selectAI(value.label)"
      >
        <q-badge
          :rounded="false"
          align="bottom"
          color="red"
          floating
          v-if="defaultAI === value.label"
        >
          <q-icon size="15px" name="check" />
        </q-badge>
      </q-avatar>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

import { getUserSettings } from "src/db";
import { platformIcons } from "src/utils/platformIcons";

const defaultAI = ref("");
const emits = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const selectAI = (ai: string) => {
  defaultAI.value = ai;
  emits("update:modelValue", ai);
};

onMounted(async () => {
  const settings = await getUserSettings();
  defaultAI.value = settings?.defaultAi || "deepseek";
  setTimeout(() => {
    emits("update:modelValue", defaultAI.value);
  }, 1000);
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
