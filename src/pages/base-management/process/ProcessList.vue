<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">공정 목록</h3>
    <div class="flex gap-2">
      <StatusUpdateDialog :rows="selectedRows" @updated="onReset" />
    </div>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="flex items-center justify-center h-ful">
              <Checkbox
                :modelValue="isAllChecked"
                @update:modelValue="toggleAll"
                @click.stop
                class="size-4 border-[1.5px]"
              />
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">공정코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">공정명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당부서</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당자</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="processList && processList.content">
          <TableRow
            v-for="(process, index) in processList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(process.processCode)"
          >
            <TableCell
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis flex justify-center"
              @click.stop
            >
              <Checkbox
                class="size-4 border-[1.5px]"
                :modelValue="selectedRows.some(r => r.id === process.processId)"
                @update:modelValue="
                  checked => toggleRow(checked, { id: process.processId, status: process.isActive })
                "
              />
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ process.processCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ process.processName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ process.userDepartment }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ process.userName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden">
              <Badge
                class="w-[50px] mx-auto"
                :class="
                  process.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ process.isActive ? '사용' : '미사용' }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="processList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetProcessList from '@/apis/query-hooks/process/useGetProcessList';
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
import FilterTab from '@/pages/base-management/process/FilterTab.vue';
import StatusUpdateDialog from '@/pages/base-management/process/StatusUpdateDialog.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();
const selectedRows = ref([]);

const initialFilters = {
  processName: route.query.processName || '',
  userName: route.query.userName || '',
  userDepartment: route.query.userDepartment || null,
};

const onReset = () => {
  selectedRows.value = [];
};

const allRows = computed(
  () =>
    processList.value?.content?.map(item => ({
      id: item.processId,
      status: item.isActive,
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

const { data: processList, page, filters } = useGetProcessList(initialFilters);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
  syncQuery();
};

// 상세 페이지로 이동.
const goToDetail = processCode => {
  router.push(`/base-management/processes/${processCode}`);
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

    filters.processName = newQuery.processName ?? '';
    filters.userName = newQuery.userName ?? null;
    filters.userDepartment = newQuery.userDepartment ?? null;
  },
);

watch([page, filters], () => {
  onReset();
});
</script>

<style scoped></style>
