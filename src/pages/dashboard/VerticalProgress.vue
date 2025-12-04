<template>
  <Card class="flex flex-col h-full">
    <CardContent class="flex-1 grid grid-cols-2 gap-6 py-6">
      <div
        v-for="gauge in gauges"
        :key="gauge.label"
        class="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 p-4 shadow-sm"
      >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            class="h-2.5 w-2.5 rounded-full"
            :class="gauge.dotClass"
            aria-hidden="true"
          ></span>
          <span class="whitespace-nowrap">{{ gauge.label }}</span>
          <span class="text-xs text-muted-foreground/70 whitespace-nowrap">
            ({{ gauge.rangeLabel }})
          </span>
        </div>

        <div class="text-3xl font-semibold text-primary">
          {{ gauge.value.toFixed(1) }}<span class="text-base font-medium">{{ gauge.unit }}</span>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex flex-col justify-between h-[180px] text-[10px] text-muted-foreground">
            <span v-for="tick in gauge.ticks" :key="tick">{{ tick }}</span>
          </div>

          <div class="relative h-[180px] w-6 overflow-hidden rounded-full bg-gradient-to-b from-muted to-muted-foreground/20">
            <div
              class="absolute bottom-0 w-full rounded-full transition-all duration-500 ease-out"
              :class="gauge.gradient"
              :style="{ height: `${gauge.fillPercent}%` }"
            ></div>

            <div class="absolute inset-1 rounded-full border border-white/30"></div>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter class="flex justify-between text-xs text-muted-foreground px-6 pb-6">
      <span>실시간 공정 환경 모니터링</span>
      <span>온도 -20~80°C · 습도 0~100%</span>
    </CardFooter>
  </Card>
</template>

<script setup>
import { computed } from 'vue';

import { Card, CardContent, CardFooter } from '@/components/ui/card';

const props = defineProps({
  temperature: Number,
  humidity: Number,
});

const calculateFillPercent = (value, min, max) => {
  if (max === min) return 0;
  const ratio = (value - min) / (max - min);
  return Math.min(100, Math.max(0, ratio * 100));
};

const gauges = computed(() => {
  const temperatureValue = Number(props.temperature ?? 0);
  const humidityValue = Number(props.humidity ?? 0);

  return [
    {
      label: '온도',
      value: temperatureValue,
      unit: '°C',
      gradient: 'bg-gradient-to-t from-red-400 via-orange-400 to-rose-500',
      dotClass: 'bg-rose-500',
      min: -20,
      max: 80,
      ticks: ['80', '60', '40', '20', '0', '-20'],
      rangeLabel: '-20 ~ 80°C',
      fillPercent: calculateFillPercent(temperatureValue, -20, 80),
    },
    {
      label: '습도',
      value: humidityValue,
      unit: '%',
      gradient: 'bg-gradient-to-t from-sky-400 via-blue-400 to-cyan-500',
      dotClass: 'bg-sky-500',
      min: 0,
      max: 100,
      ticks: ['100', '75', '50', '25', '0'],
      rangeLabel: '0 ~ 100%',
      fillPercent: calculateFillPercent(humidityValue, 0, 100),
    },
  ];
});
</script>
