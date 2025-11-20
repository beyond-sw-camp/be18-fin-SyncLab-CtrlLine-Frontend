<template>
  <Card class="flex flex-col text-center items-center">
    <CardContent class="flex-1 pb-0 w-full">
      <ChartContainer :config="COLOR_CONFIG" class="mx-auto aspect-square max-h-[180px]">
        <VisSingleContainer :data="data" :margin="{ top: 20, bottom: 20 }">
          <VisDonut
            :value="d => d.value"
            :color="d => COLOR_CONFIG[d.label]?.color"
            :arc-width="35"
            :angleRange="[-Math.PI / 2, Math.PI / 2]"
          />
        </VisSingleContainer>
      </ChartContainer>

      <div class="mt-3">
        <div>현재 사용량: {{ currentUsage }}kWh</div>
        <div>일일 최대 사용량: {{ peakUsage }}kW</div>
      </div>
    </CardContent>

    <CardFooter class="flex-col gap-2 text-sm">전력 사용량</CardFooter>
  </Card>
</template>

<script setup>
import { VisDonut, VisSingleContainer } from '@unovis/vue';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { COLOR_CONFIG } from '@/constants/chartConfig';

const props = defineProps({
  usagePercent: { type: Number, required: true },
  currentUsage: { type: Number, required: true },
  peakUsage: { type: Number, required: true },
});

const data = [
  {
    label: 'current',
    value: props.usagePercent,
  },
  {
    label: 'remaining',
    value: 100 - props.usagePercent,
  },
];
</script>
