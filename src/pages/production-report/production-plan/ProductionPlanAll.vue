<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 현황</h3>
    <Button size="sm" class="cursor-pointer w-[70px]" @click="exportCsv"> Export </Button>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <div class="overflow-x-auto">
        <Table class="w-full">
          <TableHeader class="border-b-2 border-primary">
            <TableRow>
              <TableHead
                class="sticky left-0 z-10 min-w-28 bg-white shadow-md text-center whitespace-nowrap overflow-hidden"
              >
                전표번호
              </TableHead>
              <TableHead
                class="sticky left-28 z-10 bg-white shadow-md text-center whitespace-nowrap overflow-hidden"
              >
                상태
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 공장명 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 라인명 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 품목명 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 품코드 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                생산계획수량
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                납기일자
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                생산시작시간
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                생산종료시간
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                생산담당자
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                영업담당자
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody v-if="productionPlanAll && productionPlanAll">
            <TableRow
              v-for="(productionPlan, index) in productionPlanAll"
              :key="index"
              class="text-center transition-all border-b border-dotted border-gray-300"
            >
              <TableCell
                class="sticky left-0 z-10 min-w-28 bg-white py-3 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {{ productionPlan.documentNo }}
              </TableCell>
              <TableCell class="sticky left-28 z-10 bg-white whitespace-nowrap overflow-hidden">
                <Badge class="w-[87px]" :class="STATUS_CLASSES[productionPlan.status]">
                  {{ productionPlan.status }}
                </Badge>
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.factoryName }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.lineName }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.itemName }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.itemCode }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.plannedQty }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.dueDate }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatDate(productionPlan.startTime) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatDate(productionPlan.endTime) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.productionManagerName }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ productionPlan.salesManagerName }}
              </TableCell>
            </TableRow>
            <TableRow v-if="productionPlanAll.length === 0">
              <TableCell colspan="12" class="text-center py-10 text-gray-500">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetProductionPlanAll from '@/apis/query-hooks/production-plan/useGetProductionPlanAll';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { STATUS_CLASSES } from '@/constants/productionPlanStatus';
import FilterTab from '@/pages/production-report/production-plan/FilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';
import formatDate from '@/utils/formatDate';
const route = useRoute();
const router = useRouter();

const initialFilters = {
  factoryName: route.query.factoryName || '',
  lineName: route.query.lineName || '',
  salesManagerName: route.query.salesManagerName || '',
  productionManagerName: route.query.productionManagerName || '',
  itemCode: route.query.itemCode || '',
  dueDate: route.query.dueDate || null,
  startTime: route.query.startTime || null,
  endTime: route.query.endTime || null,
};

const { data: productionPlanAll, filters } = useGetProductionPlanAll(initialFilters);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  syncQuery();
};

const syncQuery = () => {
  const query = buildQueryObject({
    ...filters,
  });

  router.replace({ query });
};

const exportCsv = () => {
  if (!productionPlanAll.value || productionPlanAll.value.length === 0) {
    return;
  }

  // CSV 헤더
  const headers = [
    '전표번호',
    '상태',
    '공장명',
    '라인명',
    '품목명',
    '품코드',
    '생산계획수량',
    '납기일자',
    '생산시작시간',
    '생산종료시간',
    '생산담당자',
    '영업담당자',
  ];

  // CSV 데이터
  const rows = productionPlanAll.value.map(item => [
    item.documentNo,
    item.status,
    item.factoryName,
    item.lineName,
    item.itemName,
    item.itemCode,
    item.plannedQty,
    item.dueDate,
    formatDate(item.startTime),
    formatDate(item.endTime),
    item.productionManagerName,
    item.salesManagerName,
  ]);

  // CSV 문자열 생성
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')),
  ].join('\n');

  // Blob 생성 후 다운로드
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;

  link.download = `production-plan-${new Date().toISOString().slice(0, 10)}.csv`;

  link.click();
  URL.revokeObjectURL(url);
};

watch(
  () => route.query,
  newQuery => {
    filters.factoryName = newQuery.factoryName ?? null;
    filters.salesManagerName = newQuery.salesManagerName ?? '';
    filters.productionManagerName = newQuery.productionManagerName ?? '';
    filters.itemCode = newQuery.itemCode ?? '';
    filters.lineName = newQuery.lineName ?? null;
    filters.dueDate = newQuery.dueDate ?? null;
    filters.startTime = newQuery.startTime ?? null;
    filters.endTime = newQuery.endTime ?? null;
  },
);
</script>

<style scoped></style>
