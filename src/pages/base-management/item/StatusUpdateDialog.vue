<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm" class="cursor-pointer w-[90px]" :disabled="!canEdit" v-if="isAdmin">
        사용여부 변경
      </Button>
    </DialogTrigger>
    <DialogContent class="rounded-2xl p-6 sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold">품목 사용여부 변경</DialogTitle>
        <DialogDescription class="flex flex-col items-center gap-3 text-gray-600 pt-1">
          <p>정말 선택된 품목의 사용여부를 변경하시겠습니까?</p>
          <Select v-model="selectedStatus">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="변경할 상태를 선택하세요." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">사용</SelectItem>
              <SelectItem value="false">미사용</SelectItem>
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
import { ref, computed, watch } from 'vue';

import useUpdateItemStatusList from '@/apis/query-hooks/item/useUpdateItemStatusList';
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
import { canView } from '@/utils/canView';

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['updated']);
const selectedStatus = ref(null);

const { mutate: callUpdateItem } = useUpdateItemStatusList();
const isAdmin = canView(['ADMIN']);

const canEdit = computed(() => {
  if (props.rows.length === 0) return false;

  const first = props.rows[0].isActive;

  const isSameState = props.rows.every(row => row.isActive === first);

  return isSameState;
});

watch(
  () => props.rows,
  () => {
    selectedStatus.value = null;
  },
  { deep: true },
);

const onUpdateStatus = () => {
  const itemIds = props.rows.map(r => r.id);
  const isActiveBoolean = selectedStatus.value === 'true';

  const params = {
    itemIds: itemIds,
    isActive: isActiveBoolean,
  };

  callUpdateItem(params);
  emit('updated');
};
</script>
