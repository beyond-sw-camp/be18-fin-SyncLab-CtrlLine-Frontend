<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 목록</h3>
    <div class="flex gap-2">
      <DeleteConfirmDialog :ids="selectedIds" @deleted="onDeleted" v-if="!isUser" />
      <Button size="sm" class="cursor-pointer w-[70px]"> 상태 수정 </Button>
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
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              <Checkbox
                :modelValue="isAllChecked"
                @update:modelValue="toggleAll"
                @click.stop
                class="size-4 border-[1.5px]"
              />
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              전표번호
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              상태
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              공장명
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              품목명
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              생산담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              영업담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              생산계획수량
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              납기일자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
              비고
            </TableHead>
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
            >
              <Checkbox
                class="size-4 border-[1.5px]"
                :modelValue="selectedIds.includes(productionPlan.id)"
                @update:modelValue="checked => toggleRow(checked, productionPlan.id)"
                @click.stop
              />
            </TableCell>
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
import { ChevronRightIcon } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
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
import FilterTab from '@/pages/production-management/production-plan/FilterTab.vue';
import { useUserStore } from '@/stores/useUserStore';
import { buildQueryObject } from '@/utils/buildQueryObject';

import DeleteConfirmDialog from './DeleteConfirmDialog.vue';

const route = useRoute();
const router = useRouter();

const disableSync = ref(false);
const currentStatus = ref(route.query.status || 'TOTAL');

const initialFilters = {
  factoryName: route.query.factoryName || '',
  salesManagerName: route.query.salesManagerName || '',
  productionManagerName: route.query.productionManagerName || '',
  itemName: route.query.itemName || '',
  dueDate: route.query.dueDate,
  startTime: route.query.startTime || null,
  endTime: route.query.endTime || null,
};

const defaultFilters = {
  factoryName: '',
  salesManagerName: '',
  productionManagerName: '',
  itemName: '',
  dueDate: null,
  startTime: null,
  endTime: null,
};

const userStore = useUserStore();
const isUser = computed(() => userStore.userRole === 'USER');

const {
  data: productionPlanList,
  page,
  filters,
} = useGetProductionPlanList(currentStatus, initialFilters);

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1; // 첫 페이지 부터 조회
};

const goToDetail = productionPlanId => {
  router.push(`/production-management/production-plans/${productionPlanId}`);
};

const selectedIds = ref([]);

const onDeleted = () => {
  selectedIds.value = [];
};

const allIds = computed(() => productionPlanList.value?.content?.map(item => item.id) ?? []);

const isAllChecked = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length === allIds.value.length,
);

// 전체 선택/해제
const toggleAll = checked => {
  selectedIds.value = checked ? [...allIds.value] : [];
};

// 개별 체크
const toggleRow = (checked, id) => {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id);
    }
  } else {
    selectedIds.value = selectedIds.value.filter(v => v !== id);
  }
};

if (route.query.page) {
  const p = Number(route.query.page);
  if (!Number.isNaN(p) && p > 0) {
    page.value = p;
  }
}

const syncQuery = () => {
  const query = buildQueryObject({
    status: currentStatus.value,
    page: page.value,
    ...filters,
  });

  router.replace({ query });
};

onMounted(() => {
  const navEntries = performance.getEntriesByType?.('navigation');
  const navType = navEntries?.[0]?.type;

  if (navType === 'reload') {
    // 내부 filter state 초기화
    Object.assign(filters, defaultFilters);

    syncQuery();
  }
});

// page / status 변경 시
watch([page, currentStatus], () => {
  if (disableSync.value) return;
});

// filters 변경 시
watch(
  () => ({ ...filters }),
  () => {
    syncQuery();
  },
  { deep: true },
);

watch(currentStatus, () => {
  page.value = 1; // 첫 페이지로 이동
});
</script>

<style scoped></style>
