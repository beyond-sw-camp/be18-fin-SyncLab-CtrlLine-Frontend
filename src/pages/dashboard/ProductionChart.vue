<template>
  <Card>
    <CardContent class="space-y-4">
      <div
        class="grid gap-4 rounded-xl border bg-muted/30 px-4 py-3 md:grid-cols-2"
        v-if="hasData"
      >
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">총 생산량</p>
          <p class="text-2xl font-semibold text-foreground">
            {{ totalProduction.toLocaleString() }}
            <span class="text-xs font-medium text-muted-foreground">EA</span>
          </p>
          <p class="text-xs text-muted-foreground">선택된 기간 총합</p>
        </div>
        <div class="text-right space-y-1">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            최근 생산량 ({{ latestLabel }})
          </p>
          <p class="text-lg font-semibold text-foreground">
            {{ latestProduction.toLocaleString() }}
            <span class="text-xs font-medium text-muted-foreground">EA</span>
          </p>
          <p
            class="text-xs font-medium"
            :class="productionDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'"
          >
            {{ productionDelta >= 0 ? '+' : '-' }}{{ Math.abs(productionDelta).toLocaleString() }}
            EA vs. 이전
          </p>
        </div>
      </div>
      <div
        v-if="hasData"
        class="h-[260px] rounded-2xl border bg-gradient-to-b from-background to-muted/30 p-4"
      >
        <ChartContainer :config="BAR_CHART_CONFIG" class="h-full">
          <VisXYContainer :data="colorizedData">
            <VisGroupedBar
              :x="d => d.date"
              :y="d => d.desktop"
              :color="d => d.color"
              :rounded-corners="6"
              :bar-padding="0.35"
              :orientation="Orientation.Horizontal"
            />

            <VisAxis
              type="y"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :num-ticks="6"
              :tick-format="formatTick"
              :tick-values="tickValues"
            />

            <ChartTooltip
              :triggers="{
                [GroupedBar.selectors.bar]: tooltipTemplate,
              }"
            />
            <ChartCrosshair :template="tooltipTemplate" color="#0000" />
          </VisXYContainer>
        </ChartContainer>
      </div>
      <p
        v-else
        class="h-[260px] flex items-center justify-center rounded-2xl border bg-muted/20 text-sm text-muted-foreground"
      >
        생산 데이터가 없습니다.
      </p>
    </CardContent>

    <CardFooter class="flex-col gap-2 text-sm">생산량</CardFooter>
  </Card>
</template>

<script setup>
import { GroupedBar, Orientation } from '@unovis/ts';
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
import { formatProductionTick } from '@/utils/productionVolume';

const props = defineProps({
  data: { type: Array, required: true },
  mode: {
    type: String,
    default: 'month',
    validator: value => ['day', 'week', 'month'].includes(value),
  },
});

const hasData = computed(() => props.data.length > 0);
const colorizedData = computed(() => {
  const total = props.data.length || 1;
  const palette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
  const getColor = index => palette[index % palette.length];

  return props.data.map((entry, index) => ({
    ...entry,
    color: entry.color || getColor(index),
    label: entry.label || formatTick(entry.date),
  }));
});

const tickValues = computed(() => colorizedData.value.map(entry => entry.date));
const totalProduction = computed(() =>
  colorizedData.value.reduce((sum, entry) => sum + Number(entry.desktop || 0), 0),
);
const latestProduction = computed(() => colorizedData.value.at(-1)?.desktop ?? 0);
const productionDelta = computed(() => {
  if (colorizedData.value.length < 2) return 0;
  const latest = colorizedData.value.at(-1)?.desktop ?? 0;
  const prev = colorizedData.value.at(-2)?.desktop ?? 0;
  return latest - prev;
});
const latestLabel = computed(() => {
  const latest = colorizedData.value.at(-1);
  if (!latest) return '';
  return latest.label || formatTick(latest.date);
});

const tooltipConfig = {
  desktop: {
    label: '생산량',
    color: BAR_CHART_CONFIG.desktop.color,
  },
};

const tooltipTemplate = componentToString(tooltipConfig, ChartTooltipContent, {
  hideLabel: true,
  valueFormatter: value => `${Number(value ?? 0).toLocaleString()} EA`,
});

const formatTick = value => formatProductionTick(props.mode, value);
</script>
