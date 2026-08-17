<template>
  <div
    v-for="(item, index) in resumeBody"
    :key="index"
    :section="'body.' + item.title"
  >
    <div
      :style="styles?.titleStyle || item.titleStyle"
      section="title"
      :field="'resume.body.title.' + index"
      contenteditable
      @blur="
        (e) =>
          updateField('title', { index }, (e.target as HTMLElement).innerText)
      "
    >
      {{ item.title }}
    </div>

    <div
      v-for="(item2, subIndex) in item.items"
      :key="subIndex"
      :field="`resume.body.header.${item.title}.` + subIndex"
    >
      <div
        class="row"
        :class="[
          { 'justify-between': item2.headerAlign == 'between' },
          { 'justify-start': item2.headerAlign == 'left' },
          { 'justify-end': item2.headerAlign == 'right' },
        ]"
        :style="styles?.headerStyle || item2.headerStyle"
      >
        <div
          :field="`resume.body.header:[${subIndex},${item2},${i}]`"
          v-for="(text, i) in item2.header"
          :key="i"
          contenteditable
          @blur="
            (e) =>
              updateField(
                'headerText',
                { index, subIndex, headerIndex: i },
                (e.target as HTMLElement).innerText,
              )
          "
        >
          {{ text }}
        </div>
      </div>

      <div
        :field="`resume.body.content:[${index},${item2}]`"
        :style="item2.contentStyle"
        contenteditable
        @blur="
          (e) =>
            updateField(
              'content',
              { index, subIndex },
              (e.target as HTMLElement).innerText,
            )
        "
      >
        {{ item2.content }}
      </div>

      <div v-if="item2.subItems">
        <ul>
          <li
            contenteditable
            v-for="(listItem, i) in item2.subItems"
            :key="i"
            @blur="
              (e) =>
                updateField(
                  'subItem',
                  { index, subIndex, listIndex: i },
                  (e.target as HTMLElement).innerText,
                )
            "
          >
            {{ listItem }}
          </li>
        </ul>
      </div>
    </div>

    <q-separator
      spaced
      :style="{ backgroundColor: `${styles.separatorColor}` }"
      v-if="styles?.separator"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  resumeBody: FlexibleResume["body"];
  styles: FlexibleResume["style"];
}>();

const emit = defineEmits<{ save: [] }>();
const updateField = (
  type: "title" | "headerText" | "content" | "subItem",
  path: {
    index: number;
    subIndex?: number;
    headerIndex?: number;
    listIndex?: number;
  },
  value: string,
) => {
  const bodyItem = props.resumeBody[path.index];
  if (!bodyItem) return;

  switch (type) {
    case "title":
      bodyItem.title = value;
      break;

    case "headerText": {
      const subItem = bodyItem.items?.[path.subIndex!];
      if (!subItem || path.headerIndex === undefined) return;
      subItem.header![path.headerIndex] = value;
      break;
    }

    case "content": {
      const subItem = bodyItem.items?.[path.subIndex!];
      if (!subItem) return;
      subItem.content = value;
      break;
    }

    case "subItem": {
      const subItem = bodyItem.items?.[path.subIndex!];
      if (!subItem?.subItems || path.listIndex === undefined) return;
      subItem.subItems[path.listIndex] = value;
      break;
    }
  }
  emit("save");
};
</script>
