<template>
  <Card>
    <CardContent class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 px-4 py-3">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">평균 불량률</p>
          <p class="text-2xl font-semibold text-foreground">
            {{ averageRate.toFixed(1) }}%
          </p>
        </div>
        <div class="text-right space-y-1">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">최근 측정값</p>
          <p class="text-lg font-semibold text-foreground">
            {{ latestRate.toFixed(1) }}%
          </p>
          <p
            class="text-xs font-medium"
            :class="rateDelta >= 0 ? 'text-rose-500' : 'text-emerald-500'"
          >
            {{ rateDelta >= 0 ? '+' : '-' }}{{ Math.abs(rateDelta).toFixed(1) }}% vs. 이전
          </p>
        </div>
      </div>
      <div
        v-if="hasData"
        class="h-[260px] rounded-2xl border bg-gradient-to-b from-background to-muted/30 p-4"
        :style="chartStyleVars"
      >
        <ChartContainer :config="BAR_CHART_CONFIG" class="h-full">
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
      <p v-else class="h-[260px] flex items-center justify-center rounded-2xl border bg-muted/20 text-sm text-muted-foreground">
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

const averageRate = computed(() => {
  if (!normalizedData.value.length) return 0;
  const total = normalizedData.value.reduce((sum, item) => sum + (item.value || 0), 0);
  return total / normalizedData.value.length;
});

const latestRate = computed(() => normalizedData.value.at(-1)?.value ?? 0);

const rateDelta = computed(() => {
  if (normalizedData.value.length < 2) return 0;
  const latest = normalizedData.value.at(-1)?.value ?? 0;
  const prev = normalizedData.value.at(-2)?.value ?? 0;
  return latest - prev;
});

const chartStyleVars = {
  '--vis-grouped-bar-fill-color': 'var(--chart-1)',
  '--vis-grouped-bar-hover-stroke-color': 'rgba(59, 130, 246, 0.45)',
  '--vis-grouped-bar-hover-stroke-width': '2px',
  '--vis-grouped-bar-stroke-color': 'rgba(59, 130, 246, 0.2)',
};
</script>
