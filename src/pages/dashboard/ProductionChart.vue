<template>
  <Card>
    <CardContent>
      <ChartContainer :config="BAR_CHART_CONFIG">
        <VisXYContainer :data="data">
          <VisGroupedBar
            :x="d => d.date"
            :y="d => d.desktop"
            :color="BAR_CHART_CONFIG.desktop.color"
            :rounded-corners="5"
            :orientation="Orientation.Horizontal"
          />

          <VisAxis
            type="y"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :num-ticks="6"
            :tick-format="formatMonth"
            :tick-values="data.map(d => d.date)"
          />

          <ChartTooltip />
          <ChartCrosshair :template="tooltipTemplate" color="#0000" />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>

    <CardFooter class="flex-col gap-2 text-sm">생산량</CardFooter>
  </Card>
</template>

<script setup>
import { Orientation } from '@unovis/ts';
import { VisGroupedBar, VisXYContainer, VisAxis } from '@unovis/vue';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartCrosshair,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart';
import { BAR_CHART_CONFIG } from '@/constants/chartConfig';

defineProps({
  data: { type: Array, required: true },
});

const tooltipTemplate = componentToString(BAR_CHART_CONFIG, ChartTooltipContent, {
  hideLabel: true,
});

const formatMonth = d => {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short' });
};
</script>
