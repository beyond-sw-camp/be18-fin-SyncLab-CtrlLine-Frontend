<template>
  <div class="flex gap-2 items-center py-4">
    <ProductionProgress :value="20" />
  </div>

  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <ChartNgType :data="ngChartData" :config="ngChartConfig" />
    <VerticalProgress :temperature="temperature" :humidity="humidity" />
    <PowerUsageGauge
      :usagePercent="usagePercent"
      :currentUsage="currentUsage"
      :peakUsage="peakUsage"
    />
  </div>

  <div class="grid gap-4 pt-4">
    <LineEquipmentStatus :lines="lines" :status-map="equipmentStatuses" />

    <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
      <DefectRateChart :data="barData" />
      <ProductionChart :data="barData" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import useGetFactoryEnergyLatest from '@/apis/query-hooks/factory/useGetFactoryEnergyLatest';
import useGetFactoryEnergyTodayMax from '@/apis/query-hooks/factory/useGetFactoryEnergyTodayMax';
import useGetFactoryEnvironmentLatest from '@/apis/query-hooks/factory/useGetFactoryEnvironmentLatest';
import useGetFactoryLinesWithEquipments from '@/apis/query-hooks/factory/useGetFactoryLinesWithEquipments';
import useGetDefectiveTypes from '@/apis/query-hooks/defective/useGetDefectiveTypes';
import useEquipmentStatusFeed from '@/composables/useEquipmentStatusFeed';
import ChartNgType from '@/pages/dashboard/ChartNgType.vue';
import DefectRateChart from '@/pages/dashboard/DefectRateChart.vue';
import LineEquipmentStatus from '@/pages/dashboard/LineEquipmentStatus.vue';
import PowerUsageGauge from '@/pages/dashboard/PowerUsageGauge.vue';
import ProductionChart from '@/pages/dashboard/ProductionChart.vue';
import ProductionProgress from '@/pages/dashboard/ProductionProgress.vue';
import VerticalProgress from '@/pages/dashboard/VerticalProgress.vue';
import { PIE_CHART_CONFIG } from '@/constants/chartConfig';

const props = defineProps({
  factoryCode: {
    type: String,
    required: true,
  },
  factoryId: {
    type: [Number, String],
    required: false,
  },
  factoryName: {
    type: String,
    default: '공장',
  },
});

const { data: environmentData } = useGetFactoryEnvironmentLatest(props.factoryCode);
const { data: energyLatest } = useGetFactoryEnergyLatest(props.factoryCode);
const { data: energyPeak } = useGetFactoryEnergyTodayMax(props.factoryCode);
const factoryIdRef = computed(() => props.factoryId);
const { data: defectiveTypes } = useGetDefectiveTypes(props.factoryCode);
const { data: factoryLines } = useGetFactoryLinesWithEquipments(factoryIdRef);
const { statusMap: equipmentStatuses } = useEquipmentStatusFeed(factoryIdRef);

const temperature = computed(() =>
  environmentData.value?.temperature ? Number(environmentData.value.temperature) : 0,
);
const humidity = computed(() =>
  environmentData.value?.humidity ? Number(environmentData.value.humidity) : 0,
);

const currentUsage = computed(() =>
  energyLatest.value?.powerConsumption ? Number(energyLatest.value.powerConsumption) : 0,
);

const peakUsage = computed(() =>
  energyPeak.value?.powerConsumption ? Number(energyPeak.value.powerConsumption) : 0,
);

const usagePercent = computed(() => {
  const peak = peakUsage.value;
  if (!peak) return 0;
  const gaugeMax = peak * 1.2;
  return Math.min(100, Math.max(0, (currentUsage.value / gaugeMax) * 100));
});

const NG_COLOR_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

const dynamicNgData = computed(() => {
  const types = defectiveTypes.value?.types;
  if (!types?.length) return null;

  return types.map((item, index) => ({
    browser: item.defectiveCode || `type-${index}`,
    visitors: Number(item.defectiveCount ?? 0),
    label: item.defectiveName || item.defectiveType || `Type ${index + 1}`,
  }));
});

const dynamicNgConfig = computed(() => {
  const data = dynamicNgData.value;
  if (!data) return PIE_CHART_CONFIG;

  return data.reduce((acc, item, index) => {
    acc[item.browser] = {
      label: item.label,
      color: NG_COLOR_PALETTE[index % NG_COLOR_PALETTE.length],
    };
    return acc;
  }, {});
});

const ngChartData = computed(() => dynamicNgData.value ?? []);
const ngChartConfig = computed(() => dynamicNgConfig.value ?? PIE_CHART_CONFIG);

const lines = computed(() => ({
  factoryName: props.factoryName || '공장',
  lines: factoryLines.value ?? [],
}));

const barData = [
  { date: new Date('2024-01-01'), desktop: 186 },
  { date: new Date('2024-02-01'), desktop: 305 },
  { date: new Date('2024-03-01'), desktop: 237 },
  { date: new Date('2024-04-01'), desktop: 73 },
  { date: new Date('2024-05-01'), desktop: 209 },
  { date: new Date('2024-06-01'), desktop: 214 },
];
</script>
