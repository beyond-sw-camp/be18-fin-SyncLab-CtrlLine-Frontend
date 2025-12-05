<template>
  <Card class="flex flex-col h-full overflow-hidden">
    <CardContent class="flex flex-col gap-4 py-4 flex-1">
      <div class="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>Power Usage</span>
        <span class="flex items-center gap-2">
          <span class="flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-[#1a237e]"></span>
            현재
          </span>
          <span class="flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-[#e0e0e0]"></span>
            잔여
          </span>
        </span>
      </div>

      <div class="relative mx-auto">
        <ChartContainer :config="COLOR_CONFIG" class="mx-auto aspect-square max-h-[200px]">
          <VisSingleContainer :data="donutData" :margin="{ top: 20, bottom: 20 }">
            <VisDonut
              :value="d => d.value"
              :color="d => COLOR_CONFIG[d.label]?.color"
              :arc-width="40"
              :pad-angle="0.02"
              :corner-radius="10"
              :angleRange="[-(Math.PI * 3) / 4, (Math.PI * 3) / 4]"
            />
          </VisSingleContainer>
        </ChartContainer>
        <div
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 2L3 14h6l-1 8 8-12h-6l1-8z"
              stroke="#facc15"
              stroke-width="1.5"
              fill="#fcd34d"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-lg border bg-muted/30 p-3">
          <div class="text-[11px] uppercase tracking-wide text-muted-foreground">현재 사용량</div>
          <div class="text-2xl font-semibold">
            {{ currentUsage.toFixed(1) }}
            <span class="text-xs font-medium text-muted-foreground">kWh</span>
          </div>
          <div class="text-xs text-muted-foreground">실시간 측정치</div>
        </div>
        <div class="rounded-lg border bg-muted/30 p-3">
          <div class="text-[11px] uppercase tracking-wide text-muted-foreground">일일 최대 사용량</div>
          <div class="text-2xl font-semibold">
            {{ peakUsage.toFixed(1) }}
            <span class="text-xs font-medium text-muted-foreground">kW</span>
          </div>
          <div class="text-xs text-muted-foreground">금일 기준 최대</div>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>소비율</span>
        <span class="font-semibold text-primary">{{ usagePercent.toFixed(1) }}%</span>
      </div>
      <Progress :model-value="usagePercent" class="h-2" />
    </CardContent>

    <CardFooter class="bg-muted/50 py-3 text-xs text-muted-foreground">
      전력 사용량 모니터링 (실시간 갱신)
    </CardFooter>
  </Card>
</template>

<script setup>
import { VisDonut, VisSingleContainer } from '@unovis/vue';
import { computed } from 'vue';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { COLOR_CONFIG } from '@/constants/chartConfig';

const props = defineProps({
  usagePercent: { type: Number, required: true },
  currentUsage: { type: Number, required: true },
  peakUsage: { type: Number, required: true },
});

const donutData = computed(() => [
  {
    label: 'current',
    value: Math.max(0, Math.min(100, Number(props.usagePercent ?? 0))),
  },
  {
    label: 'remaining',
    value: Math.max(0, 100 - Math.max(0, Math.min(100, Number(props.usagePercent ?? 0)))),
  },
]);
</script>
