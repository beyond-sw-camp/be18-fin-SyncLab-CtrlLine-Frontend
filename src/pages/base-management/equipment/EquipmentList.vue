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
            <TableHead class="text-center"><Checkbox /></TableHead>
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
            <TableCell class="table-checkbox-cell py-3 whitespace-nowrap" @click.stop>
              <Checkbox :checked="equipment.isActive" />
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
import { ref, watch } from 'vue';
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

const { data: equipmentList, refetch, page, filters } = useGetEquipmentList();
// 로컬에 있는 equipmentList가 변경되면, editableList를 갱신. (코드해석 필요)
const editableList = ref([]);
watch(
  equipmentList,
  val => {
    const list = val?.content || [];
    editableList.value = list.map(equipmentStatus => ({
      ...equipmentStatus,
      originalIsActive: equipmentStatus.isActive,
    })); // 설비 상태의 초기값 저장.
  },
  { immediate: true },
);

const { updateEquipmentList } = useUpdateEquipmentList();

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

// 첫 데이터 행의 체크박스를 클릭하면 모든 행에 같은 값 적용
const onRowToggle = index => {
  const list = editableList.value || [];
  if (!list.length) return;

  // 클릭된 행의 새로운 값
  const newValue = !list[index].isActive;
  if (index === 0) {
    // 첫 행이면 모든 행을 동일한 값으로 설정
    editableList.value = list.map(equipment => ({ ...equipment, isActive: newValue }));
  } else {
    // 클릭한, 해당 행만 토글
    const updatedList = [...editableList.value];
    updatedList[index].isActive = newValue;
    editableList.value = updatedList;
  }

  console.log('After Toggle:', list[index].equipmentCode, 'new isActive:', newValue);
};

// 변경된 상태를 DB에 저장
const saveChanges = async () => {
  const list = editableList.value || [];
  // 이것부터 안 뜨던데.
  console.log('Editablelist', list);

  const updated = list
    .filter(e => e.isActive !== e.originalIsActive)
    .map(e => ({
      equipmentCode: e.equipmentCode,
      isActive: e.isActive,
    }));

  console.log('Updated', updated);

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
