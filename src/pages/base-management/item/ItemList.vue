<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">품목 목록</h3>

    <div class="flex gap-2">
      <StatusUpdateDialog :rows="selectedRows" @updated="onReset" />

      <RouterLink to="/base-management/items/new" v-if="isAdmin">
        <Button size="sm" class="cursor-pointer w-[70px]">
          New <ChevronRightIcon class="ml-1" />
        </Button>
      </RouterLink>
    </div>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[550px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead
              v-if="isAdmin"
              class="text-center whitespace-nowrap overflow-hidden w-10"
              @click.stop
            >
              <Checkbox
                :modelValue="isAllChecked"
                @update:modelValue="toggleAll"
                class="size-4 border-[1.5px]"
              />
            </TableHead>
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
            <TableCell
              v-if="isAdmin"
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis flex justify-center"
              @click.stop
            >
              <Checkbox
                class="size-4 border-[1.5px]"
                :modelValue="selectedRows.some(r => r.id === item.id)"
                @update:modelValue="
                  checked => toggleRow(checked, { id: item.id, isActive: item.isActive })
                "
              />
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
              {{ ITEM_STATUS_LABELS[item.itemStatus] }}
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
          <TableRow v-if="itemList.content.length === 0">
            <TableCell colspan="7" class="text-center py-10 text-gray-500">
              검색 결과가 없습니다.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="itemList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { ChevronRightIcon } from 'lucide-vue-next';
import { watch, ref, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ITEM_STATUS_LABELS } from '@/constants/enumLabels';
import FilterTab from '@/pages/base-management/item/FilterTab.vue';
import StatusUpdateDialog from '@/pages/base-management/item/StatusUpdateDialog.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { buildQueryObject } from '@/utils/buildQueryObject';
import { canView } from '@/utils/canView';

const route = useRoute();
const router = useRouter();
const selectedRows = ref([]);
const authStore = useAuthStore();
const isAdmin = canView(['ADMIN']);

const initialFilters = {
  itemCode: route.query.itemCode || '',
  itemName: route.query.itemName || '',
  itemSpecification: route.query.itemSpecification || null,
  itemStatus: route.query.itemStatus || null,
  isActive: route.query.isActive || null,
};

const { data: itemList, page, filters } = useGetItemList(initialFilters);

const onReset = () => {
  selectedRows.value = [];
};

const allRows = computed(
  () =>
    itemList.value?.content?.map(item => ({
      id: item.id,
      isActive: item.isActive,
    })) ?? [],
);

const isAllChecked = computed(
  () => selectedRows.value.length > 0 && selectedRows.value.length === allRows.value.length,
);

const toggleAll = checked => {
  selectedRows.value = checked ? [...allRows.value] : [];
};

// 개별 체크
const toggleRow = (checked, row) => {
  if (checked) {
    if (!selectedRows.value.find(r => r.id === row.id)) {
      selectedRows.value.push(row);
    }
  } else {
    selectedRows.value = selectedRows.value.filter(r => r.id !== row.id);
  }
};

const goToDetail = itemId => {
  router.push(`/base-management/items/${itemId}`);
};

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  syncQuery();
  page.value = 1;
};

const syncQuery = () => {
  if (!authStore.isLoggedIn) return;

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
    filters.itemStatus = newQuery.itemStatus ?? null;
    filters.isActive =
      newQuery.isActive === 'true' ? true : newQuery.isActive === 'false' ? false : null;
  },
  { immediate: true },
);

watch([page, filters], () => {
  onReset();
});
</script>

<style scoped></style>
