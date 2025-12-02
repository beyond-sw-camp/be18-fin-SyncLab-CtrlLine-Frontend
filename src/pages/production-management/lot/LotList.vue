<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Lot No. 목록</h3>
  </div>

  <LotFilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">Lot No.</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">품목 코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">품목명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">생산수량</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">불량수량</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">불량률</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="lotList && lotList.content && lotList.content.length">
          <TableRow
            v-for="lot in lotList.content"
            :key="lot.lotId ?? lot.lotNo"
            class="hover:bg-gray-50 text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(lot.lotId)"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ lot.lotNo }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ lot.itemCode ?? '-' }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ lot.itemName ?? '-' }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ formatNumber(lot.performanceQty) }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ formatNumber(lot.defectiveQty) }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ formatRate(lot.defectiveRate) }}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow>
            <TableCell colspan="6" class="text-center py-10 text-gray-500">
              조회된 Lot No. 데이터가 없습니다.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <BasePagination v-model="page" :total-pages="lotList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetLotList from '@/apis/query-hooks/lot/useGetLotList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LotFilterTab from '@/pages/production-management/lot/LotFilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();

const initialFilters = {
  lotNo: route.query.lotNo || '',
  itemCode: route.query.itemCode || '',
  factoryCode: route.query.factoryCode || '',
  lineCode: route.query.lineCode || '',
  productionManagerNo: route.query.productionManagerNo || '',
  performanceDocumentNo: route.query.performanceDocumentNo || '',
  createdAtFrom: route.query.createdAtFrom || null,
  createdAtTo: route.query.createdAtTo || null,
  updatedAtFrom: route.query.updatedAtFrom || null,
  updatedAtTo: route.query.updatedAtTo || null,
};

const initialPage = Number(route.query.page ?? 1);

const { data: lotList, page, filters } = useGetLotList(initialFilters, initialPage);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
};

const goToDetail = lotId => {
  router.push(`/production-management/lots/${lotId}`);
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
    page.value = Number(newQuery.page ?? 1);

    filters.lotNo = newQuery.lotNo ?? '';
    filters.itemCode = newQuery.itemCode ?? '';
    filters.factoryCode = newQuery.factoryCode ?? '';
    filters.lineCode = newQuery.lineCode ?? '';
    filters.productionManagerNo = newQuery.productionManagerNo ?? '';
    filters.performanceDocumentNo = newQuery.performanceDocumentNo ?? '';
    filters.createdAtFrom = newQuery.createdAtFrom ?? null;
    filters.createdAtTo = newQuery.createdAtTo ?? null;
    filters.updatedAtFrom = newQuery.updatedAtFrom ?? null;
    filters.updatedAtTo = newQuery.updatedAtTo ?? null;
  },
  { deep: true },
);

const formatNumber = value => {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString();
};

const formatRate = value => {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `${num.toFixed(2)}%`;
};

</script>
