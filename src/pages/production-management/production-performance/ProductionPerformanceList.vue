<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 목록</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[550px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 전표번호 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 공장명 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 라인명 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 품목명 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              영업담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              생산담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 실적수량 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              불량률 (%)
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="productionPerformanceList && productionPerformanceList.content">
          <TableRow
            v-for="(performance, index) in productionPerformanceList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goDetail(performance.id)"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.documentNo }}
            </TableCell>

            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.factoryName }}
            </TableCell>

            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.lineName }}
            </TableCell>

            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.itemName }}
            </TableCell>

            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.salesManagerName }}
            </TableCell>

            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.productionManagerName }}
            </TableCell>

            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ formatQuantityWithUnit(performance.performanceQty, performance.itemUnit) }}
            </TableCell>

            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.defectRate }}
            </TableCell>
          </TableRow>
          <TableRow v-if="productionPerformanceList.content.length === 0">
            <TableCell colspan="8" class="text-center py-10 text-gray-500">
              검색 결과가 없습니다.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination
      v-model="page"
      :total-pages="productionPerformanceList?.pageInfo?.totalPages ?? 1"
    />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetProductionPerformanceList from '@/apis/query-hooks/production-performance/useGetProductionPerformanceList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// 필터 컴포넌트 이름이 FilterTab.vue로 가정하고 유지합니다.
import FilterTab from '@/pages/production-management/production-performance/FilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const goDetail = id => {
  router.push(`/production-management/production-performances/${id}`);
};

const route = useRoute();
const router = useRouter();

const parseNumberQuery = value => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parsePage = value => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
};

const initialFilters = {
  // 문서/전표/Lot
  documentDateFrom: route.query.documentDateFrom || null,
  documentDateTo: route.query.documentDateTo || null,
  productionPlanDocumentNo: route.query.productionPlanDocumentNo || '',
  defectiveDocumentNo: route.query.defectiveDocumentNo || '',
  lotNo: route.query.lotNo || '',

  // 공장/라인/품목/담당자 (Name 기준)
  factoryName: route.query.factoryName || null,
  lineName: route.query.lineName || '',
  itemName: route.query.itemName || '',
  salesManagerName: route.query.salesManagerName || '',
  salesManagerNo: route.query.salesManagerNo || '',
  productionManagerName: route.query.productionManagerName || '',
  productionManagerNo: route.query.productionManagerNo || '',

  // 기간 필드
  dueDateFrom: route.query.dueDateFrom || null,
  dueDateTo: route.query.dueDateTo || null,
  startTimeFrom: route.query.startTimeFrom || null,
  startTimeTo: route.query.startTimeTo || null,
  endTimeFrom: route.query.endTimeFrom || null,
  endTimeTo: route.query.endTimeTo || null,

  // 수량/비율 범위
  minTotalQty: parseNumberQuery(route.query.minTotalQty),
  maxTotalQty: parseNumberQuery(route.query.maxTotalQty),
  minPerformanceQty: parseNumberQuery(route.query.minPerformanceQty),
  maxPerformanceQty: parseNumberQuery(route.query.maxPerformanceQty),
  minDefectRate: parseNumberQuery(route.query.minDefectRate),
  maxDefectRate: parseNumberQuery(route.query.maxDefectRate),
};

const formatQuantityWithUnit = (quantity, unit) => {
  if (quantity === null || quantity === undefined || quantity === '') return '';
  const formattedQty = Number(quantity).toLocaleString('ko-KR');
  return `${formattedQty} ${unit || ''}`.trim();
};

const {
  data: productionPerformanceList,
  page,
  filters,
} = useGetProductionPerformanceList(initialFilters);

if (route.query.page) {
  page.value = parsePage(route.query.page);
}

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
  syncQuery();
};

const syncQuery = () => {
  const query = buildQueryObject({
    ...filters,
    page: page.value,
  });

  router.replace({ query });
};

watch(
  () => ({ ...filters }),
  () => {
    syncQuery();
  },
  { deep: true },
);

watch(page, () => {
  syncQuery();
});

watch(
  () => route.query,
  newQuery => {
    page.value = parsePage(newQuery.page ?? 1);

    filters.documentDateFrom = newQuery.documentDateFrom || null;
    filters.documentDateTo = newQuery.documentDateTo || null;

    filters.productionPlanDocumentNo = newQuery.productionPlanDocumentNo ?? '';
    filters.defectiveDocumentNo = newQuery.defectiveDocumentNo ?? '';
    filters.lotNo = newQuery.lotNo ?? '';

    filters.factoryName = newQuery.factoryName ?? null;
    filters.lineName = newQuery.lineName ?? '';
    filters.itemCode = newQuery.itemCode ?? '';
    filters.itemName = newQuery.itemName ?? '';

    filters.productionManagerName = newQuery.productionManagerName ?? '';
    filters.productionManagerNo = newQuery.productionManagerNo ?? '';
    filters.salesManagerName = newQuery.salesManagerName ?? '';
    filters.salesManagerNo = newQuery.salesManagerNo ?? '';

    filters.startTimeFrom = newQuery.startTimeFrom || null;
    filters.startTimeTo = newQuery.startTimeTo || null;
    filters.endTimeFrom = newQuery.endTimeFrom || null;
    filters.endTimeTo = newQuery.endTimeTo || null;
    filters.dueDateFrom = newQuery.dueDateFrom || null;
    filters.dueDateTo = newQuery.dueDateTo || null;

    filters.minTotalQty = parseNumberQuery(newQuery.minTotalQty);
    filters.maxTotalQty = parseNumberQuery(newQuery.maxTotalQty);
    filters.minPerformanceQty = parseNumberQuery(newQuery.minPerformanceQty);
    filters.maxPerformanceQty = parseNumberQuery(newQuery.maxPerformanceQty);
    filters.minDefectRate = parseNumberQuery(newQuery.minDefectRate);
    filters.maxDefectRate = parseNumberQuery(newQuery.maxDefectRate);
  },
  { immediate: true },
);
</script>
