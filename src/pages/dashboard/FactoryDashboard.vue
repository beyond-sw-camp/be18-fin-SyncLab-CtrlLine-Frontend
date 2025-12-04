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
    <LineEquipmentStatus :lines="lines" />

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
import useGetDefectiveTypes from '@/apis/query-hooks/defective/useGetDefectiveTypes';
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
});

const { data: environmentData } = useGetFactoryEnvironmentLatest(props.factoryCode);
const { data: energyLatest } = useGetFactoryEnergyLatest(props.factoryCode);
const { data: energyPeak } = useGetFactoryEnergyTodayMax(props.factoryCode);
const { data: defectiveTypes } = useGetDefectiveTypes(props.factoryCode);

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

const lines = {
  factoryName: '공장',
  lines: [
    {
      lineId: 10,
      lineName: 'Line 1',
      lineCode: 'L001',
      equipments: [
        { equipmentId: 101, equipmentCode: 'EQ001', equipmentName: '설비 1', status: 2 },
        { equipmentId: 102, equipmentCode: 'EQ002', equipmentName: '설비 2', status: 1 },
        { equipmentId: 103, equipmentCode: 'EQ003', equipmentName: '설비 3', status: 2 },
        { equipmentId: 104, equipmentCode: 'EQ004', equipmentName: '설비 4', status: 0 },
        { equipmentId: 105, equipmentCode: 'EQ005', equipmentName: '설비 5', status: 3 },
        { equipmentId: 106, equipmentCode: 'EQ006', equipmentName: '설비 6', status: 3 },
        { equipmentId: 107, equipmentCode: 'EQ007', equipmentName: '설비 7', status: 1 },
      ],
    },
    {
      lineId: 11,
      lineName: 'Line 2',
      lineCode: 'L002',
      equipments: [
        { equipmentId: 201, equipmentCode: 'EQ001', equipmentName: '설비 1', status: 3 },
        { equipmentId: 202, equipmentCode: 'EQ002', equipmentName: '설비 2', status: 0 },
        { equipmentId: 203, equipmentCode: 'EQ003', equipmentName: '설비 3', status: 1 },
        { equipmentId: 204, equipmentCode: 'EQ004', equipmentName: '설비 4', status: 2 },
        { equipmentId: 205, equipmentCode: 'EQ005', equipmentName: '설비 5', status: 3 },
        { equipmentId: 206, equipmentCode: 'EQ006', equipmentName: '설비 6', status: 2 },
        { equipmentId: 207, equipmentCode: 'EQ007', equipmentName: '설비 7', status: 2 },
      ],
    },
    {
      lineId: 12,
      lineName: 'Line 3',
      lineCode: 'L003',
      equipments: [
        { equipmentId: 301, equipmentCode: 'EQ001', equipmentName: '설비 1', status: 0 },
        { equipmentId: 302, equipmentCode: 'EQ002', equipmentName: '설비 2', status: 1 },
        { equipmentId: 303, equipmentCode: 'EQ003', equipmentName: '설비 3', status: 3 },
        { equipmentId: 304, equipmentCode: 'EQ004', equipmentName: '설비 4', status: 0 },
        { equipmentId: 305, equipmentCode: 'EQ005', equipmentName: '설비 5', status: 1 },
        { equipmentId: 306, equipmentCode: 'EQ006', equipmentName: '설비 6', status: 1 },
        { equipmentId: 307, equipmentCode: 'EQ007', equipmentName: '설비 7', status: 2 },
      ],
    },
  ],
};

const barData = [
  { date: new Date('2024-01-01'), desktop: 186 },
  { date: new Date('2024-02-01'), desktop: 305 },
  { date: new Date('2024-03-01'), desktop: 237 },
  { date: new Date('2024-04-01'), desktop: 73 },
  { date: new Date('2024-05-01'), desktop: 209 },
  { date: new Date('2024-06-01'), desktop: 214 },
];
</script>
