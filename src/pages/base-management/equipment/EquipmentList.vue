<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">설비 목록</h3>
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
            <TableHead
              class="text-center whitespace-nowrap overflow-hidden w-10"
              @click.stop
              v-if="isAdmin"
            >
              <!-- <Checkbox
                :modelValue="isAllChecked"
                @update:modelValue="toggleAll"
                class="size-4 border-[1.5px]"
              /> -->
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">설비코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">설비명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">설비유형</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당부서</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당자</TableHead>
            <!-- <TableHead class="text-center whitespace-nowrap overflow-hidden">사용여부</TableHead> -->
          </TableRow>
        </TableHeader>

        <TableBody v-if="equipmentList && equipmentList.content">
          <TableRow
            v-for="(equipment, index) in equipmentList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(equipment.equipmentCode)"
          >
            <TableCell
              v-if="isAdmin"
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis flex justify-center"
              @click.stop
            >
              <!-- <Checkbox
                class="size-4 border-[1.5px]"
                :modelValue="selectedRows.some(r => r.id === equipment.equipmentId)"
                @update:modelValue="
                  checked =>
                    toggleRow(checked, { id: equipment.equipmentId, isActive: equipment.isActive })
                "
              /> -->
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.equipmentCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.equipmentName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.equipmentType }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.userDepartment }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.userName }}
            </TableCell>
            <!-- <TableCell class="whitespace-nowrap overflow-hidden">
              <Badge
                class="w-[50px] mx-auto"
                :class="
                  equipment.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ equipment.isActive ? '사용' : '미사용' }}
              </Badge>
            </TableCell> -->
          </TableRow>
          <TableRow v-if="equipmentList.content.length === 0">
            <TableCell colspan="7" class="text-center py-10 text-gray-500">
              검색 결과가 없습니다.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="equipmentList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetEquipmentList from '@/apis/query-hooks/equipment/useGetEquipmentList';
import BasePagination from '@/components/pagination/BasePagination.vue';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterTab from '@/pages/base-management/equipment/FilterTab.vue';
import StatusUpdateDialog from '@/pages/base-management/equipment/StatusUpdateDialog.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { buildQueryObject } from '@/utils/buildQueryObject';
import { canView } from '@/utils/canView';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const selectedRows = ref([]);
const isAdmin = canView(['ADMIN']);

const initialFilters = {
  equipmentName: route.query.equipmentName || '',
  equipmentType: route.query.equipmentType || null,
  userName: route.query.userName || '',
  userDepartment: route.query.userDepartment || null,
};

const onReset = () => {
  selectedRows.value = [];
};

// const allRows = computed(
//   () =>
//     equipmentList.value?.content?.map(equipment => ({
//       id: equipment.equipmentId,
//       isActive: equipment.isActive,
//     })) ?? [],
// );

// const isAllChecked = computed(
//   () => selectedRows.value.length > 0 && selectedRows.value.length === allRows.value.length,
// );

// // 전체 선택/해제
// const toggleAll = checked => {
//   selectedRows.value = checked ? [...allRows.value] : [];
// };

// const toggleRow = (checked, row) => {
//   if (checked) {
//     if (!selectedRows.value.find(r => r.id === row.id)) {
//       selectedRows.value.push(row);
//     }
//   } else {
//     selectedRows.value = selectedRows.value.filter(r => r.id !== row.id);
//   }
// };

const { data: equipmentList, page, filters } = useGetEquipmentList(initialFilters);

// 검색 처리 함수
const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  syncQuery();
  page.value = 1;
};

// 상세 페이지로 이동
const goToDetail = equipmentCode => {
  router.push(`/base-management/equipments/${equipmentCode}`);
};

const syncQuery = () => {
  if (!authStore.isLoggedIn) return;

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

    filters.equipmentName = newQuery.equipmentName ?? '';
    filters.equipmentType = newQuery.equipmentType ?? null;
    filters.userName = newQuery.userName ?? null;
    filters.userDepartment = newQuery.userDepartment ?? null;
  },
  { immediate: true },
);

watch([page, filters], () => {
  onReset();
});
</script>

<style scoped></style>
