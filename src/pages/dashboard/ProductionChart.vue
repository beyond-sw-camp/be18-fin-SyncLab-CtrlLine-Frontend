<template>
  <Card>
    <CardContent>
      <div v-if="hasData" class="h-[260px]">
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
              :tick-format="formatTick"
              :tick-values="tickValues"
            />

            <ChartTooltip />
            <ChartCrosshair :template="tooltipTemplate" color="#0000" />
          </VisXYContainer>
        </ChartContainer>
      </div>
      <p
        v-else
        class="h-[260px] flex items-center justify-center text-sm text-muted-foreground"
      >
        생산 데이터가 없습니다.
      </p>
    </CardContent>

    <CardFooter class="flex-col gap-2 text-sm">생산량</CardFooter>
  </Card>
</template>

<script setup>
import { Orientation } from '@unovis/ts';
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
const tickValues = computed(() => props.data.map(entry => entry.date));

const tooltipTemplate = componentToString(BAR_CHART_CONFIG, ChartTooltipContent, {
  hideLabel: true,
});

const formatTick = value => formatProductionTick(props.mode, value);
</script>
