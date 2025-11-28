<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" size="sm" class="cursor-pointer w-[70px]"> Delete </Button>
    </DialogTrigger>
    <DialogContent class="rounded-2xl p-6 sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold">생산계획 삭제</DialogTitle>
        <DialogDescription class="flex flex-col items-center gap-1 text-gray-600">
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

const props = defineProps({
  ids: Array,
});

const emit = defineEmits(['deleted']);

const { mutate: deleteProductionPlanList } = useDeleteProductionPlanList();

const onDelete = () => {
  const params = {
    planIds: [...props.ids],
  };
  deleteProductionPlanList(params);
  emit('deleted');
};
</script>
