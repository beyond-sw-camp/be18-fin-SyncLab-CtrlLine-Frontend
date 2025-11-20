<template>
  <div class="flex gap-2 items-center py-4">
    <ProductionProgress :value="20" />
  </div>

  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <ChartNgType :data="chartData1" />
    <VerticalProgress :temperature="20" :humidity="20" />
    <PowerUsageGauge :usagePercent="70" :currentUsage="333.39" :peakUsage="221.2" />
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
import ChartNgType from '@/pages/dashboard/ChartNgType.vue';
import DefectRateChart from '@/pages/dashboard/DefectRateChart.vue';
import LineEquipmentStatus from '@/pages/dashboard/LineEquipmentStatus.vue';
import PowerUsageGauge from '@/pages/dashboard/PowerUsageGauge.vue';
import ProductionChart from '@/pages/dashboard/ProductionChart.vue';
import ProductionProgress from '@/pages/dashboard/ProductionProgress.vue';
import VerticalProgress from '@/pages/dashboard/VerticalProgress.vue';

const chartData1 = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
  { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
  { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
];

const lines = {
  factoryId: 1,
  factoryName: '본사 공장',
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
