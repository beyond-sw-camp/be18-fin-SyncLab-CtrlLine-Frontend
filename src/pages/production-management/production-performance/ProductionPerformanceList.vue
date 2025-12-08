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
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300"
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
              {{ performance.performanceQty }}
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
  productionPlanDocumentNo: route.query.productionPlanDocumentNo || '',
  factoryName: route.query.factoryName || '',
  lineName: route.query.lineName || '',
  itemName: route.query.itemName || '',
  salesManagerName: route.query.salesManagerName || '',
  productionManagerName: route.query.productionManagerName || '',
  minPerformanceQty: parseNumberQuery(route.query.minPerformanceQty),
  maxPerformanceQty: parseNumberQuery(route.query.maxPerformanceQty),
  minDefectRate: parseNumberQuery(route.query.minDefectRate),
  maxDefectRate: parseNumberQuery(route.query.maxDefectRate),
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

    filters.productionPlanDocumentNo = newQuery.productionPlanDocumentNo ?? '';
    filters.factoryName = newQuery.factoryName ?? '';
    filters.lineName = newQuery.lineName ?? '';
    filters.itemName = newQuery.itemName ?? '';
    filters.salesManagerName = newQuery.salesManagerName ?? '';
    filters.productionManagerName = newQuery.productionManagerName ?? '';
    filters.minPerformanceQty = parseNumberQuery(newQuery.minPerformanceQty);
    filters.maxPerformanceQty = parseNumberQuery(newQuery.maxPerformanceQty);
    filters.minDefectRate = parseNumberQuery(newQuery.minDefectRate);
    filters.maxDefectRate = parseNumberQuery(newQuery.maxDefectRate);
  },
  { immediate: true },
);
</script>

<style scoped></style>
