<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">공장 목록</h3>
  </div>

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center">공장코드</TableHead>
            <TableHead class="text-center">공장명</TableHead>
            <TableHead class="text-center">담당부서</TableHead>
            <TableHead class="text-center">담당자</TableHead>
            <TableHead class="text-center">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="factoryList && factoryList.content">
          <TableRow
            v-for="(factory, index) in factoryList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(factory.factoryCode)"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ factory.factoryCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ factory.factoryName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ factory.department }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ factory.name }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              <!-- <Badge class="w-[50px]" :variant="factory.isActive ? 'default' : 'outline'"> -->
              <Badge
                class="w-[50px]"
                :class="
                  factory.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ factory.isActive ? '사용' : '미사용' }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="factoryList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList.js';
import BasePagination from '@/components/pagination/BasePagination.vue';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const router = useRouter();
const { data: factoryList, page } = useGetFactoryList();

const goToDetail = factoryCode => {
  router.push(`/base-management/factories/${factoryCode}`);
};
</script>

<style scoped></style>
