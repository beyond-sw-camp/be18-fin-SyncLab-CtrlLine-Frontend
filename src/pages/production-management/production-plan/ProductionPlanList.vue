<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 목록</h3>
  </div>
  <Tabs v-model="currentStatus" class="w-full">
    <TabsList class="flex gap-3">
      <TabsTrigger value="TOTAL">Total</TabsTrigger>
      <TabsTrigger value="PENDING">Pending</TabsTrigger>
      <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
      <TabsTrigger value="RUNNING">Running</TabsTrigger>
      <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
      <TabsTrigger value="RETURNED">Returned</TabsTrigger>
    </TabsList>
  </Tabs>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >전표번호</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >상태</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >공장명</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >품목명</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >생산담당자</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >영업담당자</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >생산계획수량</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >납기일자</TableHead
            >
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >비고</TableHead
            >
          </TableRow>
        </TableHeader>

        <TableBody v-if="productionPlanList && productionPlanList.content">
          <TableRow
            v-for="(productionPlan, index) in productionPlanList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(productionPlan.id)"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.documentNo }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              <Badge class="w-[87px]" :class="STATUS_CLASSES[productionPlan.status]">
                {{ productionPlan.status }}
              </Badge>
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.factoryName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.itemName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.productionManagerName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.salesManagerName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.plannedQty }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.dueDate }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.remark ?? '-' }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="productionPlanList?.pageInfo?.totalPages ?? 1" />
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STATUS_CLASSES } from '@/constants/productionPlanStatus';
import FilterTab from '@/pages/production-management/production-plan/FilterTab.vue';

const router = useRouter();

const page = ref(1);

const filters = {
  itemName: '원형 셀 21700 5.0Ah (NCM)',
  factoryName: '제1공장',
};

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1; // 첫 페이지 부터 조회
  // refetch();
};

const productionPlanList = ref({
  content: [
    {
      id: 5,
      documentNo: '2025/11/17-1',
      status: 'PENDING',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.0Ah (NCM)',
      plannedQty: 1000000.0,
      dueDate: '2099-01-01',
      remark: '생산 일정 조정',
    },
    {
      id: 8,
      documentNo: '2025/11/18-1',
      status: 'PENDING',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.0Ah (NCM)',
      plannedQty: 1000000.0,
      dueDate: '2000-01-01',
      remark: '생산 일정 조정',
    },
    {
      id: 6,
      documentNo: '2025/11/17-2',
      status: 'PENDING',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.0Ah (NCM)',
      plannedQty: 100000.0,
      dueDate: '2000-01-01',
      remark: '생산 일정 조정',
    },
    {
      id: 7,
      documentNo: '2025/11/17-3',
      status: 'PENDING',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.0Ah (NCM)',
      plannedQty: 100000.0,
      dueDate: '2099-01-01',
      remark: '생산 일정 조정',
    },
    {
      id: 16,
      documentNo: '2025/11/20-6',
      status: 'CONFIRMED',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.0Ah (NCM)',
      plannedQty: 1000.0,
      dueDate: '2025-12-01',
      remark: '납기일정 변경 가능',
    },
    {
      id: 17,
      documentNo: '2025/11/20-7',
      status: 'PENDING',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.0Ah (NCM)',
      plannedQty: 1000.0,
      dueDate: '2025-12-01',
      remark: '납기일정 변경 가능',
    },
    {
      id: 18,
      documentNo: '2025/11/20-8',
      status: 'PENDING',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.0Ah (NCM)',
      plannedQty: 1000.0,
      dueDate: '2099-01-01',
      remark: '생산 일정 조정',
    },
    {
      id: 10,
      documentNo: '2025/11/19-2',
      status: 'COMPLETED',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.8Ah (NCA)',
      plannedQty: 50.0,
      dueDate: '2025-11-19',
      remark: 'TEST2',
    },
    {
      id: 15,
      documentNo: '2025/11/20-5',
      status: 'COMPLETED',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 21700 5.8Ah (NCA)',
      plannedQty: 47.0,
      dueDate: '2025-11-21',
    },
    {
      id: 13,
      documentNo: '2025/11/20-3',
      status: 'RUNNING',
      factoryName: '제1공장',
      salesManagerName: '이인화',
      productionManagerName: '서현원',
      itemName: '원형 셀 18650 2.5Ah (NCM)',
      plannedQty: 45.0,
      dueDate: '2025-11-21',
    },
  ],
  pageInfo: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 2,
    totalElements: 14,
    sort: [
      {
        sortBy: 'plannedQty',
        direction: 'desc',
      },
    ],
  },
});

const currentStatus = ref('TOTAL');

const goToDetail = productionPlanId => {
  router.push(`/production-management/production-plans/${productionPlanId}`);
};
</script>

<style scoped></style>
