<template>
  <div class="flex gap-2 items-center py-4">
    <span>{{ label }}</span>

    <div class="relative w-[280px]">
      <Progress :model-value="value" class="h-4" :DEFAULT_MAX="100" />

      <span
        class="absolute -top-5 text-sm font-semibold"
        :style="{ left: `${value}%`, transform: 'translateX(-50%)' }"
      >
        {{ value }}%
      </span>
    </div>

    <span class="text-sm">100%</span>
  </div>
</template>

<script setup>
import { Progress } from '@/components/ui/progress';

defineProps({
  value: Number,
  label: {
    type: String,
    default: '생산 진행률',
  },
});
</script>
