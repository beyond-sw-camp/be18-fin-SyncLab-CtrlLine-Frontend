<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Lot No. 목록</h3>
  </div>

  <Tabs v-model="currentStatus" class="w-full mt-6">
    <TabsList class="flex gap-3 flex-wrap">
      <TabsTrigger value="ALL">전체</TabsTrigger>
      <TabsTrigger value="ACTIVE">사용중</TabsTrigger>
      <TabsTrigger value="DELETED">삭제</TabsTrigger>
    </TabsList>
  </Tabs>

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
            <TableHead class="text-center whitespace-nowrap overflow-hidden">생성일</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">수정일</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">삭제여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="lotList && lotList.content && lotList.content.length">
          <TableRow
            v-for="lot in lotList.content"
            :key="lot.lotId ?? lot.lotNo"
            class="hover:bg-gray-50 text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(lot.lotNo)"
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
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ formatDateTime(lot.createdAt) }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ formatDateTime(lot.updatedAt) }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              <span :class="[lot.isDeleted ? 'text-red-500' : 'text-emerald-600']">
                {{ lot.isDeleted ? '삭제' : '사용중' }}
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow>
            <TableCell colspan="9" class="text-center py-10 text-gray-500">
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
import { ref, watch } from 'vue';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LotFilterTab from '@/pages/production-management/lot/LotFilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();

const parseBooleanQuery = value => {
  if (value === undefined) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const statusFromFlag = flag => {
  if (flag === true) return 'DELETED';
  if (flag === false) return 'ACTIVE';
  return 'ALL';
};

const flagFromStatus = status => {
  if (status === 'DELETED') return true;
  if (status === 'ACTIVE') return false;
  return null;
};

const initialIsDeleted = parseBooleanQuery(route.query.isDeleted);

const currentStatus = ref(statusFromFlag(initialIsDeleted));

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
  isDeleted: initialIsDeleted,
};

const { data: lotList, page, filters } = useGetLotList(initialFilters);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
};

const goToDetail = lotNo => {
  router.push(`/production-management/lots/${lotNo}`);
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

watch(currentStatus, newStatus => {
  const flag = flagFromStatus(newStatus);
  if (filters.isDeleted !== flag) {
    filters.isDeleted = flag;
  }
  page.value = 1;
});

watch(page, () => {
  syncQuery();
});

watch(
  () => route.query,
  newQuery => {
    const nextIsDeleted = parseBooleanQuery(newQuery.isDeleted);
    currentStatus.value = statusFromFlag(nextIsDeleted);
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
    filters.isDeleted = nextIsDeleted;
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

const formatDateTime = value => {
  if (!value) return '-';
  return value;
};
</script>
