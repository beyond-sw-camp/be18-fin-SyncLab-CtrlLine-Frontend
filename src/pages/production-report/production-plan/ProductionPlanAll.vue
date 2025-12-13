<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 현황</h3>
    <Button size="sm" class="cursor-pointer w-[70px]" @click="exportCsv" :disabled="!hasSearched">
      Export
    </Button>
  </div>

  <FilterTab :filters="filters" @search="onSearch" @reset="onReset" />

  <div class="flex flex-col">
    <div class="min-h-[550px] flex-1">
      <div class="overflow-x-auto">
        <Table class="w-full">
          <TableHeader class="border-b-2 border-primary">
            <TableRow>
              <TableHead
                class="sticky left-0 z-10 min-w-28 bg-white shadow-md text-center whitespace-nowrap overflow-hidden"
              >
                전표번호
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 상태 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 공장명 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 라인명 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 품목명 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                품목코드
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                계획 수량
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                납기일자
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                생산 시작 시각
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                생산 종료 시각
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                생산 담당자
              </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden">
                영업 담당자
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody v-if="hasSearched && productionPlanAll && productionPlanAll.length">
            <TableRow
              v-for="(productionPlan, index) in productionPlanAll"
              :key="index"
              class="text-center transition-all border-b border-dotted border-gray-300"
            >
              <TableCell
                class="sticky left-0 z-10 min-w-28 bg-white py-3 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <button
                  class="text-blue-600 underline-offset-2 hover:underline cursor-pointer"
                  type="button"
                  @click="goToProductionPlanDetail(productionPlan.id)"
                >
                  {{ productionPlan.documentNo }}
                </button>
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
          </TableBody>
          <TableBody v-else-if="hasSearched && productionPlanAll && !productionPlanAll.length">
            <TableRow>
              <TableCell colspan="12" class="text-center py-10 text-gray-500">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody v-else>
            <TableRow>
              <TableCell colspan="12" class="text-center py-10 text-gray-500">
                필터를 설정한 뒤 조회 버튼을 눌러주세요.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
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
  factoryName: '',
  lineName: '',
  salesManagerName: '',
  productionManagerName: '',
  itemCode: '',
  dueDate: null,
  startTime: null,
  endTime: null,
};

const hasSearched = ref(false);

const { data: productionPlanAll, filters } = useGetProductionPlanAll(initialFilters, hasSearched);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  hasSearched.value = true; // ← 여기 중요!
  syncQuery();
};

const onReset = newFilters => {
  Object.assign(filters, newFilters);
  hasSearched.value = false;
  router.replace({ path: route.path, query: {} });
};

const syncQuery = () => {
  const query = buildQueryObject({
    ...filters,
  });

  router.replace({ query });
};

function goToProductionPlanDetail(planId) {
  const route = router.resolve({
    name: 'ProductionPlanDetail',
    params: { productionPlanId: planId },
  });

  window.open(route.href, '_blank');
}

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
    '생산 담당자',
    '영업 담당자',
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

onMounted(() => {
  // 쿼리스트링이 남아 쿼리 비우기
  if (Object.keys(route.query).length > 0) {
    router.replace({
      path: route.path, // 현재 경로 유지
      query: {},
    });
  }
});
</script>

<style scoped></style>
