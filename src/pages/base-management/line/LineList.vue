<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">라인 목록</h3>
    <div class="flex gap-2">
      <StatusUpdateDialog :rows="selectedRows" @updated="onReset" />
    </div>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[550px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden w-10" @click.stop>
              <Checkbox
                :modelValue="isAllChecked"
                @update:modelValue="toggleAll"
                class="size-4 border-[1.5px]"
              />
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">라인코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">라인명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당부서</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당자</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="lineList && lineList.content">
          <TableRow
            v-for="(line, index) in lineList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(line.lineCode)"
          >
            <TableCell
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis flex justify-center"
              @click.stop
            >
              <Checkbox
                class="size-4 border-[1.5px]"
                :modelValue="selectedRows.some(r => r.id === line.lineId)"
                @update:modelValue="
                  checked => toggleRow(checked, { id: line.lineId, isActive: line.isActive })
                "
              />
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.lineCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.lineName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.userDepartment }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.userName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden">
              <Badge
                class="w-[50px] mx-auto"
                :class="
                  line.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ line.isActive ? '사용' : '미사용' }}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow v-if="lineList.content.length === 0">
            <TableCell colspan="6" class="text-center py-10 text-gray-500">
              검색 결과가 없습니다.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="lineList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { watch, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
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
import FilterTab from '@/pages/base-management/line/FilterTab.vue';
import StatusUpdateDialog from '@/pages/base-management/line/StatusUpdateDialog.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();
const selectedRows = ref([]);

const initialFilters = {
  lineName: route.query.lineName || '',
  userName: route.query.userName || '',
  userDepartment: route.query.userDepartment || null,
};

const { data: lineList, page, filters } = useGetLineList(initialFilters);

const onReset = () => {
  selectedRows.value = [];
};

const allRows = computed(
  () =>
    lineList.value?.content?.map(line => ({
      id: line.lineId,
      isActive: line.isActive,
    })) ?? [],
);

const isAllChecked = computed(
  () => selectedRows.value.length > 0 && selectedRows.value.length === allRows.value.length,
);

const toggleAll = checked => {
  selectedRows.value = checked ? [...allRows.value] : [];
};

const toggleRow = (checked, row) => {
  if (checked) {
    if (!selectedRows.value.find(r => r.id === row.id)) {
      selectedRows.value.push(row);
    }
  } else {
    selectedRows.value = selectedRows.value.filter(r => r.id !== row.id);
  }
};

const goToDetail = lineCode => {
  router.push(`/base-management/lines/${lineCode}`);
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

    filters.lineName = newQuery.lineName ?? '';
    filters.userName = newQuery.userName ?? '';
    filters.userDepartment = newQuery.userDepartment ?? null;
  },
  { immediate: true },
);

watch([page, filters], () => {
  onReset();
});
</script>

<style scoped></style>
