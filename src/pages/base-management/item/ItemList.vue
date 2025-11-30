<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">품목 목록</h3>
  </div>

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

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

const page = ref(1);
const itemList = ref({
  content: [
    {
      id: 2,
      itemCode: 'A2024098091',
      itemName: '마이쮸포도',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 3,
      itemCode: 'A2024098092',
      itemName: '하리보사워젤리',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 4,
      itemCode: 'A2024098093',
      itemName: '감자토스트',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 5,
      itemCode: 'A2024098094',
      itemName: '햄치즈밥버거',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 6,
      itemCode: 'A2024098095',
      itemName: '포테이토피자',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 7,
      itemCode: 'A2024098096',
      itemName: '배고프다',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 8,
      itemCode: 'A2024098097',
      itemName: '졸립다',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 9,
      itemCode: 'A2024098098',
      itemName: '흐엉',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 10,
      itemCode: 'A20240980991',
      itemName: '빅아이스아메리카노',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
    {
      id: 11,
      itemCode: 'A20240980992',
      itemName: '갑자기마라탕이땡기는데?',
      itemSpecification: '32A / 220V',
      itemUnit: 'EA',
      itemStatus: 'FINISHED_PRODUCT',
      isActive: true,
    },
  ],
  pageInfo: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 3,
    totalElements: 25,
    sort: [
      {
        sortBy: 'createdAt',
        direction: 'asc',
      },
    ],
  },
});

const goToDetail = itemId => {
  router.push(`/base-management/items/${itemId}`);
};
</script>

<style scoped></style>
