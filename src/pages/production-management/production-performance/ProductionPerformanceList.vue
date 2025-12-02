<template>
  <div>생산 실적</div>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산 실적 목록</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 전표번호 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 공장코드 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 라인코드 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 품목코드 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              영업담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              생산담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 실적수량 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 불량률 </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="productionPerformanceList && productionPerformanceList.content">
          <TableRow
            v-for="(performance, index) in productionPerformanceList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.documentNo }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.factoryCode }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.lineCode }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.itemCode }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.salesManagerNo }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.productionManagerNo }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.performanceQty }} EA.
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ performance.defectRate }} %
            </TableCell>
          </TableRow>
          <TableRow v-if="productionPerformanceList.content.length === 0">
            <TableCell colspan="9" class="text-center py-10 text-gray-500"
              >검색 결과가 없습니다.</TableCell
            >
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
  factoryCode: route.query.factoryCode || '',
  lineCode: route.query.lineCode || '',
  itemCode: route.query.itemCode || '',
  salesManagerNo: route.query.salesManagerNo || '',
  productionManagerNo: route.query.productionManagerNo || '',
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
    filters.factoryCode = newQuery.factoryCode ?? '';
    filters.lineCode = newQuery.lineCode ?? '';
    filters.itemCode = newQuery.itemCode ?? '';
    filters.salesManagerNo = newQuery.salesManagerNo ?? '';
    filters.productionManagerNo = newQuery.productionManagerNo ?? '';
    filters.minPerformanceQty = parseNumberQuery(newQuery.minPerformanceQty);
    filters.maxPerformanceQty = parseNumberQuery(newQuery.maxPerformanceQty);
    filters.minDefectRate = parseNumberQuery(newQuery.minDefectRate);
    filters.maxDefectRate = parseNumberQuery(newQuery.maxDefectRate);
  },
);
</script>

<style scoped></style>
