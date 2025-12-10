<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm" class="cursor-pointer w-[70px]" :disabled="!canEdit"> 상태 변경 </Button>
    </DialogTrigger>
    <DialogContent class="rounded-2xl p-6 sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold">생산계획 상태 변경</DialogTitle>
        <DialogDescription class="flex flex-col items-center gap-3 text-gray-600 pt-1">
          <p>정말 상태를 변경하시겠습니까?</p>
          <Select v-model="selectedStatus">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="상태를 선택하세요." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="(label, value) in PRODUCTION_PLAN_STATUS"
                :key="value"
                :value="value"
                :disabled="shouldDisableStatus(value)"
              >
                {{ label }}
              </SelectItem>
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
import { computed, ref } from 'vue';

import useUpdateProductionPlanStatusList from '@/apis/query-hooks/production-plan/useUpdateProductionPlanStatusList';
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
} from '@/components/ui/select';
import { PRODUCTION_PLAN_STATUS } from '@/constants/enumLabels';
import { useUserStore } from '@/stores/useUserStore';

const props = defineProps({
  rows: {
    type: Object,
    required: true,
  },
});

const userStore = useUserStore();
const isAdmin = computed(() => userStore.userRole === 'ADMIN');

const canEdit = computed(() => {
  if (props.rows.length === 0) return false;

  const role = userStore.userRole;
  const statuses = props.rows.map(r => r.status);
  const uniqueStatuses = new Set(statuses);

  // 상태가 하나라도 RUNNING, COMPLETED면 불가
  if ([...uniqueStatuses].some(s => ['RUNNING', 'COMPLETED', 'RETURNED'].includes(s))) {
    return false;
  }

  // 여러 상태 혼합이면 불가
  if (uniqueStatuses.size > 1) {
    return false;
  }

  const status = [...uniqueStatuses][0];

  // 권한별 조건
  if (role === 'ADMIN') {
    return ['PENDING', 'CONFIRMED'].includes(status);
  }

  return false;
});

const shouldDisableStatus = value => {
  // RUNNING, COMPLETED → 모든 사용자 비활성화
  if (['RUNNING', 'COMPLETED'].includes(value)) return true;

  // CONFIRMED → ADMIN만 선택 가능
  if (value === 'CONFIRMED' && !isAdmin.value) return true;

  // 나머지는 모든 사용자 선택 가능
  return false;
};

const emit = defineEmits(['updated']);

const selectedStatus = ref(null);

const { mutate: updateProductionPlanStatusList } = useUpdateProductionPlanStatusList();

const onUpdateStatus = () => {
  const planIds = props.rows.map(r => r.id);

  const params = {
    planIds: planIds,
    planStatus: selectedStatus.value,
  };

  updateProductionPlanStatusList(params);
  emit('updated');
};
</script>
