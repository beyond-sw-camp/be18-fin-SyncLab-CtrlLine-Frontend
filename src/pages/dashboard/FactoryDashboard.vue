<template>
  <div class="py-4">
    <div
      class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-muted/30 px-4 py-3"
    >
      <div class="space-y-1">
        <p class="text-xs uppercase tracking-wide text-muted-foreground">RUNNING 라인 진행률</p>
        <p class="text-sm font-semibold text-foreground">
          {{ productionProgressSummary.measuredCount }} /
          {{ productionProgressSummary.runningCount }}개 라인
        </p>
        <div class="text-xs text-muted-foreground flex flex-wrap gap-2">
          <span>계획 전표:</span>
          <span
            v-for="doc in productionProgressSummary.documents"
            :key="doc"
            class="rounded-full border bg-background px-2 py-0.5 font-medium text-foreground"
          >
            {{ doc }}
          </span>
          <span v-if="!productionProgressSummary.documents.length">-</span>
        </div>
      </div>
      <div class="flex-1 min-w-[200px]">
        <ProductionProgress :value="productionProgressSummary.percent" />
      </div>
      <div class="text-right space-y-1">
        <p class="text-xs uppercase tracking-wide text-muted-foreground">생산량 합계</p>
        <p class="text-lg font-semibold text-foreground">
          {{ productionProgressSummary.produced.toLocaleString() }}
          <span class="text-xs text-muted-foreground">
            / {{ productionProgressSummary.target.toLocaleString() }} EA
          </span>
        </p>
        <p v-if="!productionProgressSummary.available" class="text-xs text-muted-foreground">
          전체 라인 비가동 중입니다.
        </p>
      </div>
    </div>
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

    <div
      class="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted-foreground"
    >
      <div class="flex items-center gap-2">
        <span>품목</span>
        <Select v-model="selectedItem">
          <SelectTrigger
            class="h-8 w-[180px] rounded-full border bg-background px-3 text-xs font-medium"
          >
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
            :class="
              chartGranularity === option.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
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

import useGetDefectiveTrend from '@/apis/query-hooks/defective/useGetDefectiveTrend';
import useGetDefectiveTypes from '@/apis/query-hooks/defective/useGetDefectiveTypes';
import useGetFactoryEnergyLatest from '@/apis/query-hooks/factory/useGetFactoryEnergyLatest';
import useGetFactoryEnergyTodayMax from '@/apis/query-hooks/factory/useGetFactoryEnergyTodayMax';
import useGetFactoryEnvironmentLatest from '@/apis/query-hooks/factory/useGetFactoryEnvironmentLatest';
import useGetFactoryLinesWithEquipments from '@/apis/query-hooks/factory/useGetFactoryLinesWithEquipments';
import useGetProductionPerformanceAll from '@/apis/query-hooks/production-performance/useGetProductionPerformanceAll';
import useGetLineProductionProgress from '@/apis/query-hooks/production-progress/useGetLineProductionProgress';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PIE_CHART_CONFIG } from '@/constants/chartConfig';
import useEquipmentStatusFeed from '@/hooks/useEquipmentStatusFeed';
import ChartNgType from '@/pages/dashboard/ChartNgType.vue';
import DefectRateChart from '@/pages/dashboard/DefectRateChart.vue';
import LineEquipmentStatus from '@/pages/dashboard/LineEquipmentStatus.vue';
import PowerUsageGauge from '@/pages/dashboard/PowerUsageGauge.vue';
import ProductionChart from '@/pages/dashboard/ProductionChart.vue';
import ProductionProgress from '@/pages/dashboard/ProductionProgress.vue';
import VerticalProgress from '@/pages/dashboard/VerticalProgress.vue';
import { buildDefectRateTrend } from '@/utils/defectTrend';
import { buildProductionVolumeSeries } from '@/utils/productionVolume';

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
const factoryCodeRef = computed(() => props.factoryCode);
const { data: defectiveTypes } = useGetDefectiveTypes(props.factoryCode);
const { data: factoryLines } = useGetFactoryLinesWithEquipments(factoryIdRef);
const STATUS_LEVEL_MAP = {
  STOPPED: 1,
  RUNNING: 2,
  LOW_WARNING: 3,
  HIGH_WARNING: 4,
};

const { statusMap: equipmentStatuses } = useEquipmentStatusFeed(factoryIdRef, factoryCodeRef);
const chartGranularity = ref('week');
const selectedItem = ref('all');
const GRANULARITY_OPTIONS = [
  { value: 'day', label: '일별' },
  { value: 'week', label: '주별' },
  { value: 'month', label: '월별' },
];

const { data: defectTrendRaw } = useGetDefectiveTrend(() => props.factoryCode);
const { data: productionPerformances } = useGetProductionPerformanceAll(() => props.factoryCode);
const { data: lineProgressData } = useGetLineProductionProgress(() => props.factoryCode);

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

const getRecordItemCode = record =>
  record?.itemCode || record?.item?.itemCode || record?.itemId || null;
const getRecordItemLabel = record => {
  const code = getRecordItemCode(record);
  if (!code) return null;
  const name = record?.itemName || record?.item?.itemName || record?.item?.name || '';
  return name ? `${code} - ${name}` : code;
};

const normalizeLineValue = value => {
  if (value === undefined || value === null) return null;
  return String(value);
};

const toNumber = value => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
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

const lineProgressEntries = computed(() => lineProgressData.value ?? []);

const resolveEquipmentStatus = equipment => {
  const code = equipment?.equipmentCode;
  const external = code ? equipmentStatuses.value?.[code] : undefined;
  if (typeof external === 'number') return external;
  if (typeof external === 'string') {
    return STATUS_LEVEL_MAP[external.toUpperCase()] ?? 1;
  }
  const raw = equipment?.status ?? equipment?.equipmentStatus ?? equipment?.state;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    return STATUS_LEVEL_MAP[raw.toUpperCase()] ?? 1;
  }
  return 1;
};

const runningLineCodes = computed(() => {
  const lines = factoryLines.value ?? [];
  const set = new Set();
  lines.forEach(line => {
    const equipments = line?.equipments ?? [];
    const hasRunning = equipments.some(equipment => resolveEquipmentStatus(equipment) === 2);
    if (hasRunning) {
      const code = normalizeLineValue(line.lineCode ?? line.lineId);
      if (code) set.add(code);
    }
  });
  return set;
});

const defectRateChartData = computed(() =>
  buildDefectRateTrend(filteredDefectRecords.value ?? [], chartGranularity.value),
);

const productionSeries = computed(() =>
  buildProductionVolumeSeries(filteredProductionRecords.value ?? [], chartGranularity.value),
);
const productionChartData = computed(() => productionSeries.value.data);
const productionChartMode = computed(() => productionSeries.value.mode);
const productionProgressSummary = computed(() => {
  const runningSet = runningLineCodes.value;
  const entries = lineProgressEntries.value.filter(entry => {
    const lineCode = normalizeLineValue(entry.lineCode);
    return lineCode && runningSet.has(lineCode);
  });

  const totals = entries.reduce(
    (acc, entry) => {
      const produced = toNumber(entry.producedQty);
      const target = toNumber(entry.targetQty);
      acc.produced += produced;
      acc.target += target;
      return acc;
    },
    { produced: 0, target: 0 },
  );

  const percent =
    totals.target > 0
      ? Math.min(100, Math.max(0, Number(((totals.produced / totals.target) * 100).toFixed(1))))
      : 0;

  const documents = Array.from(new Set(entries.map(entry => entry.orderNo).filter(Boolean)));

  return {
    available: runningSet.size > 0 && totals.target > 0,
    runningCount: runningSet.size,
    measuredCount: entries.length,
    produced: totals.produced,
    target: totals.target,
    percent,
    documents,
  };
});
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
