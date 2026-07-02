<template>
  <q-card style="width: 100%" flat bordered class="q-pa-md font-uploader-card">
    <q-card-section>
      <div class="text-h6 text-primary">Font Uploader (Blob Storage)</div>
      <div class="text-subtitle2 text-grey-6">
        Upload custom TTF fonts for your PDF Export
      </div>
    </q-card-section>

    <q-card-section class="q-gutter-y-md">
      <q-input
        v-model="fontName"
        label="Font Family Name"
        outlined
        placeholder="e.g. My Custom Font"
        dense
      />

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-6">
          <q-file
            v-model="files.normal"
            label="Normal (Required)"
            outlined
            dense
            accept=".ttf"
          >
            <template v-slot:prepend>
              <q-icon name="font_download" />
            </template>
          </q-file>
        </div>

        <div class="col-12 col-sm-6">
          <q-file
            v-model="files.bold"
            label="Bold (Optional)"
            outlined
            dense
            accept=".ttf"
          >
            <template v-slot:prepend>
              <q-icon name="format_bold" />
            </template>
          </q-file>
        </div>

        <div class="col-12 col-sm-6">
          <q-file
            v-model="files.italics"
            label="Italic (Optional)"
            outlined
            dense
            accept=".ttf"
          >
            <template v-slot:prepend>
              <q-icon name="format_italic" />
            </template>
          </q-file>
        </div>

        <div class="col-12 col-sm-6">
          <q-file
            v-model="files.bolditalics"
            label="Bold Italic (Optional)"
            outlined
            dense
            accept=".ttf"
          >
            <template v-slot:prepend>
              <q-icon name="format_bold" />
            </template>
          </q-file>
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-pt-md">
      <q-btn
        label="Save Font Family"
        color="primary"
        unelevated
        @click="save"
        :disable="!isReady"
        :loading="saving"
        icon="save"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { saveFont, type FontDefinition } from "src/db";
import { useQuasar } from "quasar";

const $q = useQuasar();

const fontName = ref("");
const saving = ref(false);

const files = reactive({
  normal: null as File | null,
  bold: null as File | null,
  italics: null as File | null,
  bolditalics: null as File | null,
});

const isReady = computed(() => {
  return fontName.value && files.normal;
});

const save = async () => {
  if (!isReady.value || !files.normal) return;

  saving.value = true;
  try {
    const fontDef: FontDefinition = {
      name: fontName.value,
      normal: files.normal as Blob,
    };

    if (files.bold) fontDef.bold = files.bold as Blob;
    if (files.italics) fontDef.italics = files.italics as Blob;
    if (files.bolditalics) fontDef.bolditalics = files.bolditalics as Blob;

    await saveFont(fontDef);

    $q.notify({
      color: "positive",
      message: `Font family "${fontName.value}" saved successfully as Blobs!`,
      icon: "check_circle",
    });

    // Reset form
    fontName.value = "";
    files.normal = null;
    files.bold = null;
    files.italics = null;
    files.bolditalics = null;
  } catch (err) {
    console.error("Error saving font:", err);
    $q.notify({
      color: "negative",
      message: "Error saving font to database",
    });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.font-uploader-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;
}
</style>
