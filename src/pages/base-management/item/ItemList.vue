<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">품목 목록</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHeader class="flex items-center justify-center h-ful">
              <Checkbox class="size-4 border-[1.5px]" />
            </TableHeader>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">품목코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">품목명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">규격</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">단위</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">품목구분</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="itemList && itemList.content">
          <TableRow
            v-for="(item, index) in itemList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(item.id)"
          >
            <TableCell class="table-checkbox-cell py-3 whitespace-nowrap" @click.stop>
              <Checkbox :checked="item.isActive" class="size-4 border-[1.5px]" />
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ item.itemCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ item.itemName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ item.itemSpecification }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ item.itemUnit }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ item.itemStatus }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden">
              <Badge
                class="w-[50px]"
                :class="
                  item.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ item.isActive ? '사용' : '미사용' }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="itemList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterTab from '@/pages/base-management/item/FilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();

const initialFilters = {
  itemCode: route.query.itemCode || '',
  itemName: route.query.itemName || '',
  itemSpecification: route.query.itemSpecification || null,
  itemUnit: route.query.itemUnit || '',
  itemStatus: route.query.itemStatus || null,
  isActive: route.query.isActive || null,
};

const { data: itemList, page, filters } = useGetItemList(initialFilters);

const goToDetail = itemId => {
  router.push(`/base-management/items/${itemId}`);
};

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  syncQuery();
  page.value = 1;
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

    filters.itemCode = newQuery.itemCode ?? '';
    filters.itemName = newQuery.itemName ?? '';
    filters.itemSpecification = newQuery.itemSpecification ?? null;
    filters.itemUnit = newQuery.itemUnit ?? '';
    filters.itemStatus = newQuery.itemStatus ?? null;
    filters.isActive =
      newQuery.isActive === 'true' ? true : newQuery.isActive === 'false' ? false : null;
  },
);
</script>

<style scoped></style>
