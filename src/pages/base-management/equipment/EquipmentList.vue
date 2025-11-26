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
            <TableHead class="text-center">
              <Checkbox :checked="isAllSelected" @change="toggleAllSelection" />
            </TableHead>
            <TableHead class="text-center">설비코드</TableHead>
            <TableHead class="text-center">설비명</TableHead>
            <TableHead class="text-center">설비유형</TableHead>
            <TableHead class="text-center">담당부서</TableHead>
            <TableHead class="text-center">담당자</TableHead>
            <TableHead class="text-center">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="equipmentList && equipmentList.content">
          <TableRow
            v-for="(equipment, index) in equipmentList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(equipment.equipmentCode)"
          >
            <!--개별 선택 체크박스 코드 이해 안감. 왜 설비코드를 가져오징-->
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              <Checkbox
                :checked="selected.includes(equipment.equipmentCode)"
                @click.stop
                @change.stop="toggleSelection(equipment.equipmentCode)"
              />
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
              <!-- toggle switch: click shouldn't navigate to detail -->
              <div class="flex items-center justify-center">
                <Checkbox
                  :checked="equipment.isActive"
                  :disabled="!isAdmin || isPending(equipment.equipmentCode)"
                  @click.stop
                  @change.stop="onToggle(equipment, $event)"
                />
                <span class="ml-2 text-sm">{{ equipment.isActive ? '사용' : '미사용' }}</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
        <!-- 디버그: 데이터가 없을 때 사용자 안내 -->
        <div v-else class="p-6 text-center text-gray-500">데이터가 없습니다. (콘솔 로그 확인)</div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'vue-sonner';

import useGetEquipmentList from '@/apis/query-hooks/equipment/useGetEquipmentList';
import useUpdateEquipmentList from '@/apis/query-hooks/equipment/useUpdateEquipmentList';
import BasePagination from '@/components/pagination/BasePagination.vue';
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
import { useUserStore } from '@/stores/useUserStore';

const router = useRouter();

// list hook
const { data: equipmentList, refetch, page, filters } = useGetEquipmentList();

// update hook (batch + optimistic toggle)
const { updateEquipmentList, toggleEquipmentActiveMutation } = useUpdateEquipmentList();

// 선택된 설비의 설비 코드를 저장
const selected = ref([]);

// pending set to prevent duplicate toggles
const pending = ref(new Set());
const isPending = equipmentCode => pending.value.has(equipmentCode);

const userStore = useUserStore();
const authStore = useAuthStore();
const isAdmin = computed(() => userStore.userRole === 'ADMIN');

// 디버그 로그: equipmentList / auth 상태 확인
onMounted(() => {
  // 브라우저 콘솔에서 확인하세요
  console.log('[DEBUG] equipmentList initial', equipmentList);
  console.log('[DEBUG] userRole', userStore.userRole);
  console.log('[DEBUG] isLoggedIn', authStore.isLoggedIn);
});

watch(equipmentList, (val) => {
  console.log('[DEBUG] equipmentList changed', val);
});

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

// 선택된 설비 관리 함수
const toggleSelection = equipmentCode => {
  const index = selected.value.indexOf(equipmentCode);
  if (index === -1) {
    selected.value.push(equipmentCode); // 선택된 설비 추가
  } else {
    selected.value.splice(index, 1);
  }
};

// 전체 선택 여부
const isAllSelected = computed(() => {
  const list = equipmentList?.value?.content || [];
  return list.length > 0 && selected.value.length === list.length;
});

// 전체 선택 토글 함수
const toggleAllSelection = () => {
  if (isAllSelected.value) {
    selected.value = []; // 모두 선택 해제
  } else {
    const list = equipmentList?.value?.content || [];
    selected.value = list.map(equipment => equipment.equipmentCode); // 모든 설비 선택
  }
};

// 설비 사용여부 토글 핸들러 (Optimistic)
const onToggle = async (equipment, event) => {
  // stop row navigation
  event?.stopPropagation?.();
  if (!isAdmin.value) {
    toast.error('권한이 없습니다.');
    return;
  }

  const code = equipment.equipmentCode;
  if (!code || isPending(code)) return;

  pending.value.add(code);
  try {
    await toggleEquipmentActiveMutation.mutateAsync({
      equipmentCode: code,
      isActive: !equipment.isActive,
    });
  } catch (err) {
    console.error(err);
  } finally {
    pending.value.delete(code);
  }
};

// 변경된 상태 저장 (batch)
const saveChanges = async () => {
  const list = equipmentList?.value?.content || [];
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
