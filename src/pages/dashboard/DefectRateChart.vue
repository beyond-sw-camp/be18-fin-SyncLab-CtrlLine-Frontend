<template>
  <Card>
    <CardContent>
      <div v-if="hasData" class="h-[260px]">
        <ChartContainer :config="BAR_CHART_CONFIG">
          <VisXYContainer :data="normalizedData" :margin="{ left: 0 }" :y-domain="[0, undefined]">
            <VisGroupedBar
              :x="d => d.index"
              :y="d => d.value"
              :color="BAR_CHART_CONFIG.desktop.color"
              :rounded-corners="10"
            />
            <VisAxis
              type="x"
              :x="d => d.index"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :num-ticks="6"
              :tick-format="tickFormatter"
              :tick-values="tickValues"
            />
            <VisAxis type="y" :num-ticks="3" :tick-line="false" :domain-line="false" />
            <ChartTooltip
              :triggers="{
                [GroupedBar.selectors.bar]: tooltipTemplate,
              }"
            />
            <ChartCrosshair :template="tooltipTemplate" color="#0000" />
          </VisXYContainer>
        </ChartContainer>
      </div>
      <p v-else class="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
        생산 데이터가 없습니다.
      </p>
    </CardContent>
    <CardFooter class="flex-col gap-2 text-sm">불량률</CardFooter>
  </Card>
</template>

<script setup>
import { GroupedBar } from '@unovis/ts';
import { VisGroupedBar, VisXYContainer, VisAxis } from '@unovis/vue';
import { computed } from 'vue';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartCrosshair,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart';
import { BAR_CHART_CONFIG } from '@/constants/chartConfig';

const props = defineProps({
  data: { type: Array, required: true },
});

const normalizedData = computed(() =>
  (props.data ?? []).map((entry, index) => {
    if (entry && typeof entry === 'object' && 'value' in entry) {
      return {
        index: entry.index ?? index,
        label: entry.label ?? '',
        value: Number(entry.value ?? 0),
      };
    }

    const date = new Date(entry?.date ?? Date.now());
    return {
      index,
      label: formatMonth(date),
      value: Number(entry?.desktop ?? 0),
    };
  }),
);

const hasData = computed(() => normalizedData.value.length > 0);

const tickValues = computed(() => normalizedData.value.map(item => item.index));

const tickFormatter = value => {
  const target = normalizedData.value.find(item => item.index === value);
  return target?.label ?? '';
};

const tooltipConfig = {
  value: {
    label: '불량률',
    color: BAR_CHART_CONFIG.desktop.color,
  },
};

const tooltipTemplate = componentToString(tooltipConfig, ChartTooltipContent, {
  hideLabel: true,
  valueFormatter: value => `${Number(value ?? 0).toFixed(1)}%`,
});

const formatMonth = d => {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short' });
};
</script>
