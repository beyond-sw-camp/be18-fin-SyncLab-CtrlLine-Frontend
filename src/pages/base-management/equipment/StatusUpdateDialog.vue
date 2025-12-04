<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm" class="cursor-pointer w-[70px]" :disabled="!canEdit">
        설비 사용여부 변경</Button
      >
    </DialogTrigger>
    <DialogContent class="rounded-2xl p-6 sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold">설비 사용여부 변경</DialogTitle>
        <DialogDescription class="flex flex-col items-center gap-3 text-gray-600 pt-1">
          <p>정말 선택된 설비의 사용여부를 변경하시겠습니까? (관리자 전용)</p>
          <Select v-model="selectedStatus">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="변경할 상태를 선택하세요." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="true">사용</SelectItem>
              <SelectItem :value="false">미사용</SelectItem>
            </SelectContent>
          </Select>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="flex mt-2">
        <DialogClose as-child>
          <Button variant="outline">취소</Button>
        </DialogClose>
        <DialogClose as-child>
          <Button type="button" @click="onUpdateStatus" :disabled="!selectedStatus">수정</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref, computed, watch } from 'vue'; // watch, computed 추가
// 🟢 [가정] useMutation 훅을 사용하도록 가정

// 🟢 DB 통신 함수 (이전 답변에서 사용된 함수를 가정)
import { updateEquipment } from '@/apis/query-functions/equipment';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // SelectContent, SelectItem 추가

// ----------------------------------------------------------------------
// 1. Props, Emit, Global State (가정)
// ----------------------------------------------------------------------

const props = defineProps({
  // rows: [{ id: equipmentCode, status: isActive (boolean) }, ...]
  rows: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['updated']);

// 🟢 [가정] 사용자 역할(role)을 제공하는 userStore
const userStore = {
  userRole: 'ADMIN', // 실제 환경에서는 인증 시스템에서 가져와야 함
};

const queryClient = useQueryClient();

// ----------------------------------------------------------------------
// 2. 상태 및 뮤테이션
// ----------------------------------------------------------------------

const selectedStatus = ref(null);

// 🟢 설비 상태 업데이트 Mutation
const { mutate, isLoading: isUpdating } = useMutation({
  mutationFn: updateEquipment,
  onSuccess: () => {
    alert(`설비 ${props.rows.length}개의 사용여부가 성공적으로 변경되었습니다.`);
    // 목록 쿼리를 무효화하여 데이터 재조회 유도
    queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
    emit('updated'); // 부모 컴포넌트에 알림 (선택 초기화 유도)
    selectedStatus.value = null; // 선택 상태 초기화
  },
  onError: error => {
    console.error('설비 사용여부 변경 오류:', error);
    alert('설비 사용여부 변경 중 오류가 발생했습니다.');
  },
});

// ----------------------------------------------------------------------
// 3. 로직 함수
// ----------------------------------------------------------------------

/**
 * 설비 상태 업데이트 요청
 */
const onUpdateStatus = () => {
  if (props.rows.length === 0 || selectedStatus.value === null) return;

  // 1. 서버 전송을 위한 데이터 구조 정의
  const updates = props.rows.map(r => ({
    equipmentCode: r.id, // r.id는 equipmentCode를 담고 있음
    isActive: selectedStatus.value, // 사용자가 선택한 true/false 값
  }));

  const params = {
    equipments: updates, // API 엔드포인트에 맞게 구조 조정이 필요할 수 있음
  };

  // 2. 뮤테이션 실행
  mutate(params);
};

/**
 * Dialog Trigger 활성화 여부 결정 (ADMIN 권한 및 선택 여부)
 */
const canEdit = computed(() => {
  // 1. 선택된 설비가 없으면 비활성화
  if (props.rows.length === 0) return false;

  const role = userStore.userRole;

  // 2. ADMIN 권한이 아니면 무조건 비활성화
  if (role !== 'ADMIN') {
    return false;
  }

  // 3. ADMIN이고, 설비가 하나 이상 선택되었으면 활성화
  return true;
});

// 🟢 rows가 변경될 때 selectedStatus를 초기화
watch(
  () => props.rows,
  () => {
    selectedStatus.value = null;
  },
  { deep: true },
);
</script>
