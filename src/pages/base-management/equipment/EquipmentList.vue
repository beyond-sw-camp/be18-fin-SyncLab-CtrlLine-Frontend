<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">설비 목록 조회</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center"
              ><Checkbox :checked="areAllEditableActive" @change="toggleAllEditableActive"
            /></TableHead>
            <TableHead class="text-center">설비코드</TableHead>
            <TableHead class="text-center">설비명</TableHead>
            <TableHead class="text-center">설비유형</TableHead>
            <TableHead class="text-center">담당부서</TableHead>
            <TableHead class="text-center">담당자</TableHead>
            <TableHead class="text-center">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="editableList && editableList.length">
          <TableRow
            v-for="(equipment, index) in editableList"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(equipment.equipmentCode)"
          >
            <!-- 왼쪽: isActive 편집 토글 -->
            <TableCell class="table-checkbox-cell py-3 whitespace-nowrap">
              <Checkbox
                :checked="equipment.isActive"
                @click.stop
                @change.stop="equipment.isActive = !equipment.isActive"
              />
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
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              <Badge
                class="w-[50px] mx-auto"
                :class="
                  (equipment.originalStatus ?? equipment.isActive)
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ (equipment.originalStatus ?? equipment.isActive) ? '사용' : '미사용' }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <!-- 사용여부 저장 버튼 추가-->
    <div class="flex justify-end mt-4">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        @click="saveChanges"
      >
        사용여부 저장
      </button>
    </div>

    <BasePagination v-model="page" :total-pages="equipmentList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import useGetEquipmentList from '@/apis/query-hooks/equipment/useGetEquipmentList';
import useUpdateEquipmentList from '@/apis/query-hooks/equipment/useUpdateEquipmentList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
// 테이블 UI 컴포넌트
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterTab from '@/pages/base-management/equipment/FilterTab.vue';

const router = useRouter();

// list hook
const { data: equipmentList, refetch, page, filters } = useGetEquipmentList();

// editable local copy to avoid mutating vue-query cache directly
const editableList = ref([]);
watch(
  equipmentList,
  val => {
    const list = val?.content || [];
    editableList.value = list.map(item => ({ ...item, originalStatus: item.isActive }));
  },
  { immediate: true },
);

// update hook (batch)
const { updateEquipmentList } = useUpdateEquipmentList();

// (선택 기능 제거 — 왼쪽 열은 isActive 편집용 토글입니다)

// 검색 처리 함수
const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
  refetch();
};

// 상세 페이지로 이동
const goToDetail = equipmentCode => {
  router.push(`/base-management/equipments/${equipmentCode}`);
};

// (이전 선택 로직은 제거되었습니다 — 왼쪽 열은 isActive 편집용 토글입니다.)

// (리스트 편집에서는 로컬 editableList를 사용하므로 낙관적 토글 핸들러는 사용하지 않습니다)

const areAllEditableActive = computed(() => {
  return editableList.value.length > 0 && editableList.value.every(e => e.isActive === true);
});

const toggleAllEditableActive = () => {
  const set = !areAllEditableActive.value;
  editableList.value = editableList.value.map(e => ({ ...e, isActive: set }));
};

// 변경된 상태 저장 (batch)
const saveChanges = async () => {
  const list = editableList.value || [];
  const updated = list
    .filter(e => e.isActive !== (e.originalStatus ?? e.isActive))
    .map(e => ({ equipmentCode: e.equipmentCode, isActive: e.isActive }));
  if (!updated.length) {
    toast('변경된 항목이 없습니다.');
    return;
  }

  try {
    await updateEquipmentList(updated);
    toast.success('저장되었습니다.');
    refetch();
  } catch (err) {
    console.error(err);
    toast.error('저장에 실패했습니다.');
  }
};
</script>

<style scoped>
.table-checkbox-cell {
  width: 40px;
  text-align: center;
}
</style>
