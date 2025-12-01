<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 목록</h3>
    <div class="flex gap-2">
      <DeleteConfirmDialog :rows="selectedRows" @deleted="onReset" />
      <StatusUpdateDialog :rows="selectedRows" @updated="onReset" />
      <RouterLink to="/production-management/production-plans/new">
        <Button size="sm" class="cursor-pointer w-[70px]">
          New <ChevronRightIcon class="ml-1" />
        </Button>
      </RouterLink>
    </div>
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
            <TableHead class="text-center whitespace-nowrap overflow-hidden w-10">
              <Checkbox
                :modelValue="isAllChecked"
                @update:modelValue="toggleAll"
                @click.stop
                class="size-4 border-[1.5px]"
              />
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 전표번호 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 상태 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 공장명 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 품목명 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              생산담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              영업담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              생산계획수량
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 납기일자 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 비고 </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="productionPlanList && productionPlanList.content">
          <TableRow
            v-for="(productionPlan, index) in productionPlanList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(productionPlan.id)"
          >
            <TableCell
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis flex justify-center"
              @click.stop
            >
              <Checkbox
                class="size-4 border-[1.5px]"
                :modelValue="selectedRows.some(r => r.id === productionPlan.id)"
                @update:modelValue="
                  checked =>
                    toggleRow(checked, { id: productionPlan.id, status: productionPlan.status })
                "
              />
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ productionPlan.documentNo }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden">
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
import { ChevronRightIcon } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

import useGetProductionPlanList from '@/apis/query-hooks/production-plan/useGetProductionPlanList';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STATUS_CLASSES } from '@/constants/productionPlanStatus';
import DeleteConfirmDialog from '@/pages/production-management/production-plan/DeleteConfirmDialog.vue';
import FilterTab from '@/pages/production-management/production-plan/FilterTab.vue';
import StatusUpdateDialog from '@/pages/production-management/production-plan/StatusUpdateDialog.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();

const currentStatus = ref(route.query.status || 'TOTAL');

const initialFilters = {
  factoryName: route.query.factoryName || '',
  salesManagerName: route.query.salesManagerName || '',
  productionManagerName: route.query.productionManagerName || '',
  itemName: route.query.itemName || '',
  dueDate: route.query.dueDate || null,
  startTime: route.query.startTime || null,
  endTime: route.query.endTime || null,
};

const {
  data: productionPlanList,
  page,
  filters,
} = useGetProductionPlanList(currentStatus, initialFilters);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  syncQuery();
  page.value = 1; // 첫 페이지 부터 조회
};

const goToDetail = productionPlanId => {
  router.push(`/production-management/production-plans/${productionPlanId}`);
};

const selectedRows = ref([]);

const onReset = () => {
  selectedRows.value = [];
};

const allRows = computed(
  () =>
    productionPlanList.value?.content?.map(item => ({
      id: item.id,
      status: item.status,
    })) ?? [],
);

const isAllChecked = computed(
  () => selectedRows.value.length > 0 && selectedRows.value.length === allRows.value.length,
);

// 전체 선택/해제
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

const syncQuery = () => {
  const query = buildQueryObject({
    status: currentStatus.value,
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

watch(currentStatus, () => {
  page.value = 1; // 상태 바뀌면 1페이지로
  syncQuery();
});

watch(page, () => {
  syncQuery();
});

// 뒤로가기 시 필터 동기화
watch(
  () => route.query,
  newQuery => {
    currentStatus.value = newQuery.status ?? 'TOTAL';
    page.value = Number(newQuery.page ?? 1);

    filters.factoryName = newQuery.factoryName ?? null;
    filters.salesManagerName = newQuery.salesManagerName ?? '';
    filters.productionManagerName = newQuery.productionManagerName ?? '';
    filters.itemName = newQuery.itemName ?? '';
    filters.dueDate = newQuery.dueDate ?? null;
    filters.startTime = newQuery.startTime ?? null;
    filters.endTime = newQuery.endTime ?? null;
  },
);

// 페이지, 필터링, 상태 변경 시 체크 해제
watch([page, filters, currentStatus], () => {
  onReset();
});
</script>

<style scoped></style>
