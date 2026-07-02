<template>
  <div
    class="countdown-container"
    :class="[!flat ? 'shadow-2' : '', bordered ? 'bordered' : '', qClass]"
  >
    <div
      v-if="label"
      :class="
        labelClass ||
        'text-caption text-grey-7 text-uppercase text-weight-bold q-mb-sm'
      "
    >
      {{ label }}
    </div>

    <div class="flex items-center no-wrap justify-center q-gutter-x-sm">
      <div
        v-for="(value, unit, index) in timeLeft"
        :key="unit"
        class="flex items-center no-wrap"
      >
        <div class="column items-center">
          <div
            :class="[sizeClass, textColorClass, 'text-weight-bold']"
            style="line-height: 1"
          >
            {{ formatNumber(value) }}
          </div>
          <div
            v-if="showLabels"
            class="text-caption text-grey-6 text-uppercase"
            style="font-size: 0.6rem; margin-top: 2px"
          >
            {{ unit }}
          </div>
        </div>

        <div
          v-if="index < Object.keys(timeLeft).length - 1"
          class="q-mx-xs"
          :class="textColorClass"
        >
          <span :class="sizeClass" style="opacity: 0.5; line-height: 1">:</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

interface Props {
  targetDate: string | Date;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  size?: "xs" | "sm" | "md" | "lg" | "xl" | string;
  color?: string;
  labelClass?: string;
  qClass?: string;
  flat?: boolean;
  bordered?: boolean;
  showLabels?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  color: "primary",
  flat: true,
  bordered: false,
  showLabels: true,
});

const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

let timer: ReturnType<typeof setInterval> | null = null;

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: "text-subtitle2",
    sm: "text-h6",
    md: "text-h5",
    lg: "text-h4",
    xl: "text-h2",
  };
  return (
    map[props.size] ||
    (props.size.startsWith("text-") ? props.size : `text-${props.size}`)
  );
});

const textColorClass = computed(() => {
  return props.color.startsWith("text-") ? props.color : `text-${props.color}`;
});

const calculateTimeLeft = () => {
  const target = new Date(props.targetDate).getTime();
  const now = new Date().getTime();
  const difference = target - now;

  if (difference > 0) {
    timeLeft.value = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  } else {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (timer) clearInterval(timer);
  }
};

const formatNumber = (num: number) => {
  return num.toString().padStart(2, "0");
};

onMounted(() => {
  calculateTimeLeft();
  timer = setInterval(calculateTimeLeft, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.countdown-container {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 8px;

  &.bordered {
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
}

:deep(.body--dark) .countdown-container.bordered {
  border-color: rgba(255, 255, 255, 0.12);
}

.text-weight-bold {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
</style>
