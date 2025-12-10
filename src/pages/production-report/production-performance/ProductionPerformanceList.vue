<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 현황</h3>
    <Button size="sm" class="cursor-pointer w-[70px]" @click="exportCsv" :disabled="!exportEnabled">
      Export
    </Button>
  </div>

  <FilterTab :filters="filters" @search="onSearch" @reset="onReset" />

  <div class="flex flex-col">
    <div class="min-h-[550px] flex-1">
      <div class="overflow-x-auto">
        <Table class="w-full">
          <TableHeader class="border-b-2 border-primary">
            <TableRow>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">전표번호</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">공장명</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">라인명</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">품목명</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">품목코드</TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산계획번호</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산담당자</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >영업담당자</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산시작시간</TableHead
              >
              <TableHead class="text-center whitespace-nowrap overflow-hidden"
                >생산종료시간</TableHead
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
                {{ row.productionManagerName ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.salesManagerName ?? '-' }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatDate(row.startTime) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatDate(row.endTime) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatCount(row.performanceQty) }} EA.
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatCount(row.defectiveQty) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatRate(row.defectRate) }}
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
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetProductionPerformanceReport from '@/apis/query-hooks/production-performance/useGetProductionPerformanceReport';
import { Button } from '@/components/ui/button';
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

const route = useRoute();
const router = useRouter();

const defaultFilters = {
  factoryCode: null,
  lineCode: null,
  productionPlanDocumentNo: '',
  itemCode: '',
  productionManagerName: '',
  salesManagerName: '',
  minPerformanceQty: null,
  maxPerformanceQty: null,
  minDefectRate: null,
  maxDefectRate: null,
  startTimeFrom: null,
  startTimeTo: null,
  endTimeFrom: null,
  endTimeTo: null,
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
  productionPlanDocumentNo:
    query.productionPlanDocumentNo ?? defaultFilters.productionPlanDocumentNo,
  itemCode: query.itemCode ?? defaultFilters.itemCode,
  productionManagerName: query.productionManagerName ?? defaultFilters.productionManagerName,
  salesManagerName: query.salesManagerName ?? defaultFilters.salesManagerName,
  minPerformanceQty: parseNumericFilter(query.minPerformanceQty, defaultFilters.minPerformanceQty),
  maxPerformanceQty: parseNumericFilter(query.maxPerformanceQty, defaultFilters.maxPerformanceQty),
  minDefectRate: parseNumericFilter(query.minDefectRate, defaultFilters.minDefectRate),
  maxDefectRate: parseNumericFilter(query.maxDefectRate, defaultFilters.maxDefectRate),
  startTimeFrom: query.startTimeFrom ?? defaultFilters.startTimeFrom,
  startTimeTo: query.startTimeTo ?? defaultFilters.startTimeTo,
  endTimeFrom: query.endTimeFrom ?? defaultFilters.endTimeFrom,
  endTimeTo: query.endTimeTo ?? defaultFilters.endTimeTo,
});

const hasFilterValues = filters =>
  Object.values(filters).some(value => value !== null && value !== '');

const initialFilters = buildFiltersFromQuery(route.query);
const hasSearched = ref(hasFilterValues(initialFilters));
const { data: productionPerformanceAll, filters } = useGetProductionPerformanceReport(
  initialFilters,
  hasSearched,
);

watch(
  () => route.query,
  newQuery => {
    const parsed = buildFiltersFromQuery(newQuery ?? {});
    Object.assign(filters, parsed);
    hasSearched.value = hasFilterValues(parsed);
  },
  { immediate: true },
);

const performanceRows = computed(() => productionPerformanceAll.value ?? []);

const exportEnabled = computed(() => hasSearched.value && performanceRows.value.length > 0);

const formatCount = value => (value === undefined || value === null ? '-' : value);
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
    '품코드',
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
    item.productionManagerName ?? '',
    item.salesManagerName ?? '',
    formatDate(item.startTime),
    formatDate(item.endTime),
    item.performanceQty ?? '',
    item.defectiveQty ?? '',
    item.defectRate ?? '',
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
