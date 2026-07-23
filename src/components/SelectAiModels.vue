<template>
  <div class="">
    <div class="row justify-between">
      <!-- ChatGPT -->
      <q-avatar
        size="50px"
        color="blue-grey-8"
        text-color="white"
        :icon="'img:' + chatgptIcon"
        class="cursor-pointer"
        @click="selectAI('chatgpt')"
      >
        <q-badge rounded floating color="red" v-if="defaultAI === 'chatgpt'">
          <q-icon name="check" />
        </q-badge>
      </q-avatar>

      <!-- DeepSeek - white background because icon is blue -->
      <q-avatar
        size="50px"
        color="white"
        text-color="black"
        :icon="'img:' + deepseekIcon"
        class="cursor-pointer"
        @click="selectAI('deepseek')"
      >
        <q-badge rounded floating color="red" v-if="defaultAI === 'deepseek'">
          <q-icon name="check" />
        </q-badge>
      </q-avatar>

      <!-- Gemini - black background -->
      <q-avatar
        size="50px"
        color="black"
        text-color="white"
        :icon="'img:' + geminiIcon"
        class="cursor-pointer"
        @click="selectAI('gemini')"
      >
        <q-badge rounded floating color="red" v-if="defaultAI === 'gemini'">
          <q-icon name="check" />
        </q-badge>
      </q-avatar>

      <!-- Qwen - white background -->
      <q-avatar
        size="50px"
        color="white"
        text-color="black"
        :icon="'img:' + qwenIcon"
        class="cursor-pointer"
        @click="selectAI('qwen')"
      >
        <q-badge rounded floating color="red" v-if="defaultAI === 'qwen'">
          <q-icon name="check" />
        </q-badge>
      </q-avatar>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import chatgptIcon from "../assets/chatgpt-icon.svg";
import deepseekIcon from "../assets/deepseek-logo-icon.svg";
import geminiIcon from "../assets/google-gemini-icon.svg";
import qwenIcon from "../assets/qwen-ai-icon.svg";

const defaultAI = ref("deepseek");
const emits = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const selectAI = (ai: string) => {
  defaultAI.value = ai;
  emits("update:modelValue", ai);
};

onMounted(() => {
  emits("update:modelValue", defaultAI.value);
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
