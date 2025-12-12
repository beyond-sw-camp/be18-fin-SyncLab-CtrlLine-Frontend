<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 현황</h3>
    <Button size="sm" class="cursor-pointer w-[70px]" @click="exportCsv" :disabled="!exportEnabled">
      Export
    </Button>
  </div>

  <FilterTab :filters="filters" @search="onSearch" @reset="onReset" />

  <div v-if="chartsVisible" class="grid gap-4 lg:grid-cols-2 my-6">
    <Card class="h-[340px]">
      <CardContent class="flex h-full flex-col justify-center">
        <div v-if="defectiveTrendData.length" class="h-[260px] w-full">
          <ChartContainer :config="defectiveChartConfig" cursor>
            <VisXYContainer
              :data="defectiveTrendData"
              :margin="{ left: 40, right: 16, bottom: 32 }"
            >
              <VisLine
                :x="d => d.index"
                :y="d => d.value"
                :color="defectiveChartConfig.value.color"
                :line-width="3"
              />
              <VisAxis
                type="x"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
                :tick-format="trendTickFormatter"
                :tick-values="trendTickValues"
              />
              <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false">
                <template #tickFormat="{ value }">
                  {{ Number(value ?? 0).toLocaleString() }}
                </template>
              </VisAxis>
              <ChartTooltip />
              <ChartCrosshair :template="defectiveTooltipTemplate" color="#0000" />
            </VisXYContainer>
          </ChartContainer>
        </div>
        <p v-else class="text-sm text-gray-400 text-center">표시할 불량 데이터가 없습니다.</p>
      </CardContent>
      <CardFooter class="justify-center text-sm text-gray-500">불량 추이</CardFooter>
    </Card>

    <Card class="h-[340px]">
      <CardContent class="flex h-full flex-col justify-center">
        <div v-if="performanceTrendData.length" class="h-[260px] w-full">
          <ChartContainer :config="performanceChartConfig" cursor>
            <VisXYContainer
              :data="performanceTrendData"
              :margin="{ left: 40, right: 16, bottom: 32 }"
            >
              <VisLine
                :x="d => d.index"
                :y="d => d.value"
                :color="performanceChartConfig.value.color"
                :line-width="3"
              />
              <VisAxis
                type="x"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
                :tick-format="trendTickFormatter"
                :tick-values="trendTickValues"
              />
              <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false">
                <template #tickFormat="{ value }">
                  {{ Number(value ?? 0).toLocaleString() }}
                </template>
              </VisAxis>
              <ChartTooltip />
              <ChartCrosshair :template="performanceTooltipTemplate" color="#0000" />
            </VisXYContainer>
          </ChartContainer>
        </div>
        <p v-else class="text-sm text-gray-400 text-center">표시할 실적수량 데이터가 없습니다.</p>
      </CardContent>
      <CardFooter class="justify-center text-sm text-gray-500">실적수량 추이</CardFooter>
    </Card>
  </div>

  <div class="flex flex-col">
    <div class="min-h-[550px] flex-1">
      <div class="overflow-x-auto">
        <Table class="w-full">
          <TableHeader class="border-b-2 border-primary">
            <TableRow>
              <TableHead
                class="sticky left-0 z-10 min-w-28 bg-white shadow-md text-center whitespace-nowrap overflow-hidden"
                >전표번호</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden">공장명</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">라인명</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">품목명</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">품목코드</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산 계획번호</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산 담당자</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >영업 담당자</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산 시작 시각</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산 종료 시각</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden">실적수량</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">불량수량</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">불량률</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody v-if="hasSearched && performanceRows?.length">
            <TableRow
              v-for="(row, index) in performanceRows"
              :key="index"
              class="text-center transition-all border-b border-dotted border-gray-300"
            >
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">{{
                row.documentNo
              }}</TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.factoryName ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.lineName ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.itemName ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.itemCode ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.productionPlanDocumentNo ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.productionManagerEmpName ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.salesManagerEmpName ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatDate(row.startTime) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatDate(row.endTime) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatNumber(row.performanceQty) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatNumber(row.defectiveQty) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatRate(row.defectiveRate) }}
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody v-else-if="hasSearched">
            <TableRow>
              <TableCell colspan="13" class="text-center py-10 text-gray-500">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody v-else>
            <TableRow>
              <TableCell colspan="13" class="text-center py-10 text-gray-500">
                필터를 설정한 뒤 조회 버튼을 눌러주세요.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VisXYContainer, VisAxis, VisLine } from '@unovis/vue';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetProductionPerformanceReport from '@/apis/query-hooks/production-performance/useGetProductionPerformanceReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartCrosshair,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterTab from '@/pages/production-report/production-performance/FilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';
import formatDate from '@/utils/formatDate';
import { formatNumber } from '@/utils/formatNumber';

const route = useRoute();
const router = useRouter();

const defaultFilters = {
  factoryCode: null,
  lineCode: null,
  documentNo: '',
  productionPlanDocumentNo: '',
  itemCode: '',
  productionManagerEmpName: '',
  productionManagerName: '',
  salesManagerEmpName: '',
  salesManagerName: '',
  minPerformanceQty: null,
  maxPerformanceQty: null,
  minDefectRate: null,
  maxDefectRate: null,
  startTimeFrom: null,
  startTimeTo: null,
  endTimeFrom: null,
  endTimeTo: null,
  startDateTimeStart: null,
  startDateTimeEnd: null,
  endDateTimeStart: null,
  endDateTimeEnd: null,
};

const parseNumericFilter = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? fallback : numberValue;
};

const buildFiltersFromQuery = query => ({
  factoryCode: query.factoryCode ?? defaultFilters.factoryCode,
  lineCode: query.lineCode ?? defaultFilters.lineCode,
  documentNo: query.documentNo ?? defaultFilters.documentNo,
  productionPlanDocumentNo:
    query.productionPlanDocumentNo ?? defaultFilters.productionPlanDocumentNo,
  itemCode: query.itemCode ?? defaultFilters.itemCode,
  productionManagerEmpName:
    query.productionManagerEmpName ??
    query.productionManagerName ??
    defaultFilters.productionManagerEmpName,
  productionManagerName:
    query.productionManagerName ??
    query.productionManagerEmpName ??
    defaultFilters.productionManagerName,
  salesManagerEmpName:
    query.salesManagerEmpName ?? query.salesManagerName ?? defaultFilters.salesManagerEmpName,
  salesManagerName:
    query.salesManagerName ?? query.salesManagerEmpName ?? defaultFilters.salesManagerName,
  minPerformanceQty: parseNumericFilter(query.minPerformanceQty, defaultFilters.minPerformanceQty),
  maxPerformanceQty: parseNumericFilter(query.maxPerformanceQty, defaultFilters.maxPerformanceQty),
  minDefectRate: parseNumericFilter(query.minDefectRate, defaultFilters.minDefectRate),
  maxDefectRate: parseNumericFilter(query.maxDefectRate, defaultFilters.maxDefectRate),
  startTimeFrom:
    query.startTimeFrom ??
    query.startDateTimeStart ??
    query.startDateTimeFrom ??
    defaultFilters.startTimeFrom,
  startTimeTo:
    query.startTimeTo ??
    query.startDateTimeEnd ??
    query.startDateTimeTo ??
    defaultFilters.startTimeTo,
  endTimeFrom:
    query.endTimeFrom ??
    query.endDateTimeStart ??
    query.endDateTimeFrom ??
    defaultFilters.endTimeFrom,
  endTimeTo:
    query.endTimeTo ?? query.endDateTimeEnd ?? query.endDateTimeTo ?? defaultFilters.endTimeTo,
  startDateTimeStart: query.startDateTimeStart ?? defaultFilters.startDateTimeStart,
  startDateTimeEnd: query.startDateTimeEnd ?? defaultFilters.startDateTimeEnd,
  endDateTimeStart: query.endDateTimeStart ?? defaultFilters.endDateTimeStart,
  endDateTimeEnd: query.endDateTimeEnd ?? defaultFilters.endDateTimeEnd,
});

const hasFilterValues = filters =>
  Object.values(filters).some(value => value !== null && value !== '');

const initialFilters = buildFiltersFromQuery(route.query);
const hasSearched = ref(hasFilterValues(initialFilters));
const { data: productionPerformanceAll, filters } = useGetProductionPerformanceReport(
  initialFilters,
  hasSearched,
);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

watch(
  () => route.query,
  newQuery => {
    const parsed = buildFiltersFromQuery(newQuery ?? {});
    Object.assign(filters, parsed);
    hasSearched.value = hasFilterValues(parsed);
  },
  { immediate: true },
);

const rawPerformanceRows = computed(() => productionPerformanceAll.value ?? []);

const matchesKeyword = (source, keyword, exact = false) => {
  const base = String(source ?? '')
    .trim()
    .toLowerCase();
  const target = String(keyword ?? '')
    .trim()
    .toLowerCase();
  if (!target) return true;
  return exact ? base === target : base.includes(target);
};

const performanceRows = computed(() => {
  let rows = rawPerformanceRows.value;
  const docKeyword = (filters.documentNo ?? '').trim();
  if (docKeyword) {
    rows = rows.filter(row => matchesKeyword(row.documentNo, docKeyword, true));
  }

  const managerKeyword = filters.productionManagerEmpName ?? filters.productionManagerName ?? '';
  if (managerKeyword) {
    rows = rows.filter(row =>
      matchesKeyword(row.productionManagerEmpName ?? row.productionManagerName, managerKeyword),
    );
  }

  const salesKeyword = filters.salesManagerEmpName ?? filters.salesManagerName ?? '';
  if (salesKeyword) {
    rows = rows.filter(row =>
      matchesKeyword(row.salesManagerEmpName ?? row.salesManagerName, salesKeyword),
    );
  }

  return rows;
});

const chartRecords = computed(() => (hasSearched.value ? performanceRows.value : []));

const parseDateSafe = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pickFilterDate = keys => {
  for (const key of keys) {
    const raw = filters[key];
    if (!raw) continue;
    const parsed = parseDateSafe(raw);
    if (parsed) return parsed;
  }
  return null;
};

const filterDateRange = computed(() => {
  const start = pickFilterDate([
    'startDateTimeStart',
    'startTimeFrom',
    'startDateTimeFrom',
    'endDateTimeStart',
    'endTimeFrom',
  ]);
  const end = pickFilterDate([
    'startDateTimeEnd',
    'startTimeTo',
    'startDateTimeTo',
    'endDateTimeEnd',
    'endTimeTo',
  ]);

  if (start && end && end < start) {
    return { start: end, end: start };
  }
  return { start, end };
});

const getISOWeekInfo = date => {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp - yearStart) / MS_PER_DAY + 1) / 7);

  const start = new Date(tmp);
  const startDay = start.getUTCDay() || 7;
  start.setUTCDate(tmp.getUTCDate() - startDay + 1);
  return { year: tmp.getUTCFullYear(), week, start: new Date(start.getTime()) };
};

const getBucketInfo = (date, mode) => {
  if (mode === 'day') {
    const key = date.toISOString().slice(0, 10);
    const label = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const floor = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return { key, label, sortKey: floor.getTime() };
  }
  if (mode === 'week') {
    const info = getISOWeekInfo(date);
    const label = `${String(info.week).padStart(2, '0')}주`;
    return {
      key: `${info.year}-W${String(info.week).padStart(2, '0')}`,
      label,
      sortKey: info.start.getTime(),
    };
  }
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const label = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  return { key: label, label, sortKey: first.getTime() };
};

const resolveRecordDate = record =>
  parseDateSafe(
    record?.startTime ?? record?.startDateTime ?? record?.endTime ?? record?.endDateTime ?? null,
  );

const normalizeQty = value => {
  const numeric = Number(value ?? 0);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const trendBuckets = computed(() => {
  if (!chartRecords.value.length) {
    return { mode: 'day', data: [] };
  }

  const entries = chartRecords.value
    .map(record => {
      const date = resolveRecordDate(record);
      if (!date) return null;
      return {
        date,
        defectiveQty: normalizeQty(record.defectiveQty),
        performanceQty: normalizeQty(record.performanceQty),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  if (!entries.length) {
    return { mode: 'day', data: [] };
  }

  let rangeStart = filterDateRange.value.start ?? entries[0].date;
  let rangeEnd = filterDateRange.value.end ?? entries[entries.length - 1].date;

  if (rangeStart && rangeEnd && rangeEnd < rangeStart) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }

  if (!rangeStart && rangeEnd) rangeStart = rangeEnd;
  if (!rangeEnd && rangeStart) rangeEnd = rangeStart;

  const spanDays =
    rangeStart && rangeEnd ? Math.max(1, Math.round((rangeEnd - rangeStart) / MS_PER_DAY) + 1) : 1;

  const mode = spanDays <= 7 ? 'day' : spanDays <= 42 ? 'week' : 'month';

  const bucketMap = new Map();
  entries.forEach(entry => {
    const bucketInfo = getBucketInfo(entry.date, mode);
    const bucket = bucketMap.get(bucketInfo.key) || {
      ...bucketInfo,
      defectiveQty: 0,
      performanceQty: 0,
    };
    bucket.defectiveQty += entry.defectiveQty;
    bucket.performanceQty += entry.performanceQty;
    bucketMap.set(bucketInfo.key, bucket);
  });

  const data = Array.from(bucketMap.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((bucket, index) => ({
      ...bucket,
      index,
    }));

  return { mode, data };
});

const defectiveTrendData = computed(() =>
  trendBuckets.value.data.map(entry => ({
    index: entry.index,
    label: entry.label,
    value: entry.defectiveQty,
  })),
);

const performanceTrendData = computed(() =>
  trendBuckets.value.data.map(entry => ({
    index: entry.index,
    label: entry.label,
    value: entry.performanceQty,
  })),
);

const trendTickValues = computed(() => trendBuckets.value.data.map(entry => entry.index));
const trendTickFormatter = value => {
  const target = trendBuckets.value.data.find(entry => entry.index === value);
  return target?.label ?? '';
};

const defectiveChartConfig = {
  value: { label: '불량수량', color: 'var(--chart-1)' },
};
const performanceChartConfig = {
  value: { label: '실적수량', color: 'var(--chart-2)' },
};

const defectiveTooltipTemplate = componentToString(defectiveChartConfig, ChartTooltipContent, {
  hideLabel: true,
  valueFormatter: value => `${Number(value ?? 0).toLocaleString()} EA`,
});
const performanceTooltipTemplate = componentToString(performanceChartConfig, ChartTooltipContent, {
  hideLabel: true,
  valueFormatter: value => `${Number(value ?? 0).toLocaleString()} EA`,
});

const chartsVisible = computed(() => hasSearched.value && chartRecords.value.length > 0);

const exportEnabled = computed(() => hasSearched.value && performanceRows.value.length > 0);

// const formatCount = value => (value === undefined || value === null ? '-' : value);
const formatRate = value => (value === undefined || value === null ? '-' : `${value} %`);

const syncQuery = () => {
  const query = buildQueryObject({ ...filters });
  router.replace({ query });
};

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  hasSearched.value = true;
  syncQuery();
};

const onReset = newFilters => {
  Object.assign(filters, newFilters);
  hasSearched.value = false;
  router.replace({ path: route.path, query: {} });
};

const exportCsv = () => {
  if (!performanceRows.value.length) {
    return;
  }

  const headers = [
    '전표번호',
    '공장명',
    '라인명',
    '품목명',
    '품목코드',
    '생산계획번호',
    '생산담당자',
    '영업담당자',
    '생산시작시간',
    '생산종료시간',
    '실적수량',
    '불량수량',
    '불량률',
  ];

  const rows = performanceRows.value.map(item => [
    item.documentNo ?? '',
    item.factoryName ?? '',
    item.lineName ?? '',
    item.itemName ?? '',
    item.itemCode ?? '',
    item.productionPlanDocumentNo ?? '',
    item.productionManagerEmpName ?? '',
    item.salesManagerEmpName ?? '',
    formatDate(item.startTime),
    formatDate(item.endTime),
    formatNumber(item.performanceQty ?? ''),
    formatNumber(item.defectiveQty ?? ''),
    item.defectiveRate ?? '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(value => `"${value ?? ''}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `production-performance-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped></style>
