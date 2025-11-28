<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" size="sm" class="cursor-pointer w-[70px]" :disabled="!canDelete">
        Delete
      </Button>
    </DialogTrigger>
    <DialogContent class="rounded-2xl p-6 sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold">생산계획 삭제</DialogTitle>
        <DialogDescription class="flex flex-col items-center gap-1 text-gray-600 pt-1">
          <p>정말 삭제하시겠습니까?</p>
          <p>삭제된 항목은 복구할 수 없습니다.</p>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="flex mt-2">
        <DialogClose as-child>
          <Button variant="outline">취소</Button>
        </DialogClose>
        <DialogClose as-child>
          <Button type="button" @click="onDelete">삭제</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue';

import useDeleteProductionPlanList from '@/apis/query-hooks/production-plan/useDeleteProductionPlanList';
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
import { useUserStore } from '@/stores/useUserStore';

const props = defineProps({
  rows: {
    type: Object,
    required: true,
  },
});

const userStore = useUserStore();

const canDelete = computed(() => {
  const role = userStore.userRole;
  const statuses = props.rows.map(r => r.status);
  const uniqueStatuses = new Set(statuses);

  // 선택된 항목이 없으면 삭제 불가
  if (props.rows.length === 0) return false;

  // RUNNING/COMPLETED 포함 시 삭제 불가 (상세조회와 동일)
  if ([...uniqueStatuses].some(s => ['RUNNING', 'COMPLETED'].includes(s))) {
    return false;
  }

  // ADMIN은 여기서 true
  if (role === 'ADMIN') return true;

  return false;
});

const emit = defineEmits(['deleted']);

const { mutate: deleteProductionPlanList } = useDeleteProductionPlanList();

const onDelete = () => {
  const ids = props.rows.map(r => r.id);

  deleteProductionPlanList({ planIds: ids });
  emit('deleted');
};
</script>
