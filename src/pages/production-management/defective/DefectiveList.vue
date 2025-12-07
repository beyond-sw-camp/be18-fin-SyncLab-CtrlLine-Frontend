<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">불량 목록</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[550px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">전표번호</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">품목코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">품목명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">라인명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">불량수량</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">불량률</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">실적전표</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="defectiveList && defectiveList.content">
          <TableRow
            v-for="(defective, index) in defectiveList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(defective.planDefectiveId)"
          >
            <TableCell
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis flex justify-center"
            >
              {{ defective.defectiveDocNo }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.itemCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.itemName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.lineName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.defectiveTotalQty }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.defectiveTotalRate }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.productionPerformanceDocNo }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="defectiveList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetDefectiveList from '@/apis/query-hooks/defective/useGetDefectiveList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterTab from '@/pages/production-management/defective/FilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();

const initialFilters = {
  defectiveDocNo: route.query.defectiveDocNo || '',
  itemCode: route.query.itemCode || '',
  itemName: route.query.itemName || '',
  lineName: route.query.lineName || '',
  productionPerformanceDocNo: route.query.productionPerformanceDocNo || '',
};

const { data: defectiveList, page, filters } = useGetDefectiveList(initialFilters);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
  syncQuery();
};

const goToDetail = planDefectiveId => {
  router.push(`/production-management/defectives/${planDefectiveId}`);
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

    filters.defectiveDocNo = newQuery.defectiveDocNo ?? '';
    filters.itemCode = newQuery.itemCode ?? '';
    filters.itemName = newQuery.itemName ?? '';
    filters.lineName = newQuery.lineName ?? '';
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped></style>
