<template>
  <Card>
    <CardContent class="space-y-4">
      <div class="grid gap-4 rounded-xl border bg-muted/30 px-4 py-3 md:grid-cols-2">
        <div class="flex items-center justify-between gap-4">
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
          v-if="forecastRate !== null"
          class="rounded-lg border bg-background/80 px-3 py-2 text-right text-sm shadow-sm"
        >
          <p class="text-xs uppercase tracking-wide text-muted-foreground">예상 다음 불량률</p>
          <p class="text-xl font-semibold text-foreground">
            {{ forecastRate.toFixed(1) }}%
          </p>
          <p
            class="text-xs font-medium"
            :class="forecastDelta >= 0 ? 'text-rose-500' : 'text-emerald-500'"
          >
            {{ forecastDelta >= 0 ? '+' : '-' }}{{ Math.abs(forecastDelta).toFixed(1) }}% 추정
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
              :color="d => d.color"
              :rounded-corners="6"
              :bar-padding="0.45"
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

const baseData = computed(() =>
  (props.data ?? []).map((entry, index) => {
    if (entry && typeof entry === 'object' && 'value' in entry) {
      return {
        index,
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

const forecastRate = computed(() => {
  const predicted = predictNextValue(baseData.value);
  if (predicted === null || Number.isNaN(predicted)) return null;
  return Math.max(predicted, 0);
});

const normalizedData = computed(() => {
  const entries = baseData.value.map(item => ({ ...item, isForecast: false }));
  const forecast = forecastRate.value;
  if (forecast !== null) {
    entries.push({
      index: entries.length,
      label: '예상',
      value: forecast,
      isForecast: true,
    });
  }

  const total = entries.length || 1;
  return entries.map((item, index) => ({
    ...item,
    index,
    color: item.isForecast ? FORECAST_BAR_COLOR : getBarColor(index, total),
  }));
});

const hasData = computed(() => baseData.value.length > 0);

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

const predictNextValue = data => {
  const n = data.length;
  if (n < 2) return null;
  const xs = data.map((_, index) => index);
  const ys = data.map(item => Number(item.value ?? 0));

  const xMean = xs.reduce((sum, value) => sum + value, 0) / n;
  const yMean = ys.reduce((sum, value) => sum + value, 0) / n;

  const numerator = xs.reduce(
    (acc, x, idx) => acc + (x - xMean) * (ys[idx] - yMean),
    0,
  );
  const denominator = xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0);

  const slope =
    denominator === 0
      ? ys[n - 1] - ys[n - 2]
      : numerator / denominator;
  const intercept = yMean - slope * xMean;
  const nextX = n;
  return intercept + slope * nextX;
};

const dashboardPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const FORECAST_BAR_COLOR = 'rgba(59, 130, 246, 0.35)';

const getBarColor = (index, total) => {
  if (!total) return dashboardPalette[0];
  const paletteIndex = index % dashboardPalette.length;
  return dashboardPalette[paletteIndex];
};

const averageRate = computed(() => {
  if (!baseData.value.length) return 0;
  const total = baseData.value.reduce((sum, item) => sum + (item.value || 0), 0);
  return total / baseData.value.length;
});

const latestRate = computed(() => baseData.value.at(-1)?.value ?? 0);

const rateDelta = computed(() => {
  if (baseData.value.length < 2) return 0;
  const latest = baseData.value.at(-1)?.value ?? 0;
  const prev = baseData.value.at(-2)?.value ?? 0;
  return latest - prev;
});

const forecastDelta = computed(() => {
  if (forecastRate.value === null) return 0;
  return forecastRate.value - latestRate.value;
});

const chartStyleVars = {
  '--vis-grouped-bar-fill-color': 'var(--chart-1)',
  '--vis-grouped-bar-hover-stroke-color': 'rgba(59, 130, 246, 0.45)',
  '--vis-grouped-bar-hover-stroke-width': '2px',
  '--vis-grouped-bar-stroke-color': 'rgba(59, 130, 246, 0.2)',
};
</script>
