<template>
  <Card class="flex flex-col text-center">
    <CardContent class="flex-1 pb-0">
      <ChartContainer :config="PIE_CHART_CONFIG" class="mx-auto aspect-square max-h-[200px]">
        <VisSingleContainer :data="data" :margin="{ top: 30, bottom: 30 }">
          <VisDonut
            :value="d => d.visitors"
            :color="d => PIE_CHART_CONFIG[d.browser]?.color"
            :arc-width="0"
          />

          <ChartTooltip
            :triggers="{
              [Donut.selectors.segment]: tooltipTemplate,
            }"
          />
        </VisSingleContainer>
      </ChartContainer>
    </CardContent>
    <CardFooter class="flex-col gap-2 text-sm">NG Type</CardFooter>
  </Card>
</template>

<script setup>
import { Donut } from '@unovis/ts';
import { VisDonut, VisSingleContainer } from '@unovis/vue';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart';
import { PIE_CHART_CONFIG } from '@/constants/chartConfig';

defineProps({
  data: { type: Array, required: true },
});

const tooltipTemplate = componentToString(PIE_CHART_CONFIG, ChartTooltipContent, {
  hideLabel: true,
});
</script>
