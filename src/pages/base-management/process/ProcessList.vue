<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">공정 목록</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center"><Checkbox /></TableHead>
            <TableHead class="text-center">공정코드</TableHead>
            <TableHead class="text-center">공정명</TableHead>
            <TableHead class="text-center">담당부서</TableHead>
            <TableHead class="text-center">담당자</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="processList && processList.content">
          <TableRow
            v-for="(process, index) in processList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(process.processCode)"
          >
            <TableCell class="table-checkbox-cell py-3 whitespace-nowrap" @click.stop>
              <Checkbox />
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
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="processList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

import useGetProcessList from '@/apis/query-hooks/process/useGetProcessList';
import BasePagination from '@/components/pagination/BasePagination.vue';
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

const router = useRouter();

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
  refetch();
};

const goToDetail = processCode => {
  router.push(`/base-management/processes/${processCode}`);
};

const { data: processList, refetch, page, filters } = useGetProcessList();
</script>

<style scoped></style>
