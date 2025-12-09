<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <ChartContainer :config="chartConfig" class="mx-auto aspect-square max-h-[220px]">
        <VisSingleContainer :data="data" :margin="{ top: 20, bottom: 20, left: 10, right: 10 }">
          <VisDonut
            :value="d => d.visitors"
            :color="d => chartConfig[d.browser]?.color"
            :arc-width="40"
            :corner-radius="8"
            :pad-angle="0.01"
          />

        </VisSingleContainer>
      </ChartContainer>
      <div
        class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center"
      >
        <span class="text-[11px] uppercase tracking-wide text-muted-foreground">Total NG</span>
        <span class="text-2xl font-semibold">{{ totalNg.toLocaleString() }}</span>
      </div>
    </div>

    <div v-if="showList" class="flex flex-col gap-3">
      <div
        v-for="item in sortedData"
        :key="item.browser"
        class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
      >
        <div class="flex items-center gap-2">
          <span
            class="h-2 w-2 rounded-full"
            :style="{ backgroundColor: chartConfig[item.browser]?.color }"
          ></span>
          <div class="flex flex-col text-xs">
            <span class="font-medium text-foreground">{{ item.label }}</span>
            <span class="text-muted-foreground">{{ item.browser }}</span>
          </div>
        </div>
        <div class="text-right text-xs">
          <div class="font-semibold">{{ item.visitors.toLocaleString() }}</div>
          <div class="text-muted-foreground">{{ item.percent.toFixed(1) }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VisDonut, VisSingleContainer } from '@unovis/vue';
import { computed } from 'vue';

import { ChartContainer } from '@/components/ui/chart';
import { PIE_CHART_CONFIG } from '@/constants/chartConfig';

const props = defineProps({
  data: { type: Array, required: true },
  config: {
    type: Object,
    default: () => PIE_CHART_CONFIG,
  },
  showList: {
    type: Boolean,
    default: true,
  },
});

const chartConfig = computed(() => props.config ?? PIE_CHART_CONFIG);

const totalNg = computed(() => props.data.reduce((sum, item) => sum + Number(item.visitors || 0), 0));

const sortedData = computed(() => {
  const total = totalNg.value || 1;
  return props.data
    .map(item => ({
      ...item,
      percent: (Number(item.visitors || 0) / total) * 100,
      label: item.label || chartConfig.value[item.browser]?.label || item.browser,
    }))
    .sort((a, b) => b.visitors - a.visitors);
});

</script>
