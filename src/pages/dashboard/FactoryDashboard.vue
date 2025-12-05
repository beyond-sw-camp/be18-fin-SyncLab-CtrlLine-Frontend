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

    <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
      <div class="flex items-center gap-2">
        <span>품목</span>
        <Select v-model="selectedItem">
          <SelectTrigger class="h-8 w-[180px] rounded-full border bg-background px-3 text-xs font-medium">
            <SelectValue placeholder="전체 품목" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in itemOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <span>데이터 단위</span>
        <div class="inline-flex rounded-full border bg-background p-0.5">
          <Button
            v-for="option in GRANULARITY_OPTIONS"
            :key="option.value"
            size="sm"
            variant="ghost"
            class="rounded-full px-3 py-1 text-xs font-medium transition"
            :class="chartGranularity === option.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
            @click="chartGranularity = option.value"
          >
            {{ option.label }}
          </Button>
        </div>
      </div>
    </div>

    <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
      <DefectRateChart :data="defectRateChartData" />
      <ProductionChart :data="productionChartData" :mode="productionChartMode" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import useGetFactoryEnergyLatest from '@/apis/query-hooks/factory/useGetFactoryEnergyLatest';
import useGetFactoryEnergyTodayMax from '@/apis/query-hooks/factory/useGetFactoryEnergyTodayMax';
import useGetFactoryEnvironmentLatest from '@/apis/query-hooks/factory/useGetFactoryEnvironmentLatest';
import useGetFactoryLinesWithEquipments from '@/apis/query-hooks/factory/useGetFactoryLinesWithEquipments';
import useGetDefectiveTypes from '@/apis/query-hooks/defective/useGetDefectiveTypes';
import useGetDefectiveTrend from '@/apis/query-hooks/defective/useGetDefectiveTrend';
import useEquipmentStatusFeed from '@/composables/useEquipmentStatusFeed';
import ChartNgType from '@/pages/dashboard/ChartNgType.vue';
import DefectRateChart from '@/pages/dashboard/DefectRateChart.vue';
import LineEquipmentStatus from '@/pages/dashboard/LineEquipmentStatus.vue';
import PowerUsageGauge from '@/pages/dashboard/PowerUsageGauge.vue';
import ProductionChart from '@/pages/dashboard/ProductionChart.vue';
import ProductionProgress from '@/pages/dashboard/ProductionProgress.vue';
import VerticalProgress from '@/pages/dashboard/VerticalProgress.vue';
import useGetProductionPerformanceAll from '@/apis/query-hooks/production-performance/useGetProductionPerformanceAll';
import { PIE_CHART_CONFIG } from '@/constants/chartConfig';
import { buildDefectRateTrend } from '@/utils/defectTrend';
import { buildProductionVolumeSeries } from '@/utils/productionVolume';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

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
const chartGranularity = ref('week');
const selectedItem = ref('all');
const GRANULARITY_OPTIONS = [
  { value: 'day', label: '일별' },
  { value: 'week', label: '주별' },
  { value: 'month', label: '월별' },
];

const { data: defectTrendRaw } = useGetDefectiveTrend(() => props.factoryCode);
const { data: productionPerformances } = useGetProductionPerformanceAll(() => props.factoryCode);

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

const getRecordItemCode = record => record?.itemCode || record?.item?.itemCode || record?.itemId || null;
const getRecordItemLabel = record => {
  const code = getRecordItemCode(record);
  if (!code) return null;
  const name = record?.itemName || record?.item?.itemName || record?.item?.name || '';
  return name ? `${code} - ${name}` : code;
};

const itemOptions = computed(() => {
  const map = new Map();
  const addRecord = record => {
    const code = getRecordItemCode(record);
    if (!code) return;
    if (!map.has(code)) {
      map.set(code, getRecordItemLabel(record) || code);
    }
  };

  (productionPerformances.value ?? []).forEach(addRecord);
  (defectTrendRaw.value ?? []).forEach(addRecord);

  const options = Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [{ value: 'all', label: '전체 품목' }, ...options];
});

const filteredDefectRecords = computed(() => {
  const list = defectTrendRaw.value ?? [];
  if (selectedItem.value === 'all') return list;
  return list.filter(record => getRecordItemCode(record) === selectedItem.value);
});

const filteredProductionRecords = computed(() => {
  const list = productionPerformances.value ?? [];
  if (selectedItem.value === 'all') return list;
  return list.filter(record => getRecordItemCode(record) === selectedItem.value);
});

const defectRateChartData = computed(() =>
  buildDefectRateTrend(filteredDefectRecords.value ?? [], chartGranularity.value),
);

const productionSeries = computed(() =>
  buildProductionVolumeSeries(filteredProductionRecords.value ?? [], chartGranularity.value),
);
const productionChartData = computed(() => productionSeries.value.data);
const productionChartMode = computed(() => productionSeries.value.mode);

watch(
  itemOptions,
  options => {
    if (selectedItem.value === 'all') return;
    const exists = options.some(option => option.value === selectedItem.value);
    if (!exists) {
      selectedItem.value = 'all';
    }
  },
  { immediate: true },
);
</script>
