<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">설비 목록</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden w-10">
              <Checkbox class="size-4 border-[1.5px]" />
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">설비코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">설비명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">설비유형</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당부서</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당자</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="equipmentList && equipmentList.content">
          <TableRow
            v-for="(equipment, index) in equipmentList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(equipment.equipmentCode)"
          >
            <!-- 왼쪽: isActive 편집 토글 -->
            <TableCell class="table-checkbox-cell py-3 whitespace-nowrap" @click.stop>
              <Checkbox :checked="equipment.isActive" class="size-4 border-[1.5px]" />
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
            <TableCell class="whitespace-nowrap overflow-hidden">
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
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <!-- 사용여부 저장 버튼 추가-->
    <div class="flex justify-end mt-4">
      <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        사용여부 저장
      </button>
    </div>

    <BasePagination v-model="page" :total-pages="equipmentList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetEquipmentList from '@/apis/query-hooks/equipment/useGetEquipmentList';
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
import FilterTab from '@/pages/base-management/equipment/FilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';

const route = useRoute();
const router = useRouter();

const initialFilters = {
  equipmentName: route.query.equipmentName || '',
  equipmentType: route.query.equipmentType || null,
  userName: route.query.userName || '',
  userDepartment: route.query.userDepartment || null,
};

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
);
</script>

<style scoped></style>
