<template>
  <Dialog>
    <DialogTrigger as-child>
      <!-- <Button size="sm" class="cursor-pointer w-[90px]" :disabled="!canEdit" v-if="isAdmin">
        사용여부 변경
      </Button> -->
    </DialogTrigger>
    <DialogContent class="rounded-2xl p-6 sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold">설비 사용여부 변경</DialogTitle>
        <DialogDescription class="flex flex-col items-center gap-3 text-gray-600 pt-1">
          <p>정말 선택된 설비의 사용여부를 변경하시겠습니까?</p>
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
import { ref, watch } from 'vue';

import useUpdateEquipmentStatusList from '@/apis/query-hooks/equipment/useUpdateEquipmentStatusList';
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
// import { canView } from '@/utils/canView';

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['updated']);
const selectedStatus = ref(null);

const { mutate: callUpdateEquipment } = useUpdateEquipmentStatusList();
// const isAdmin = canView(['ADMIN']);

// const canEdit = computed(() => {
//   if (props.rows.length === 0) return false;

//   const first = props.rows[0].isActive;

//   const isSameState = props.rows.every(row => row.isActive === first);

//   return isSameState;
// });

watch(
  () => props.rows,
  () => {
    selectedStatus.value = null;
  },
  { deep: true },
);

const onUpdateStatus = () => {
  // @ts-ignore
  const equipmentIds = props.rows.map(r => r.id);
  const isActiveBoolean = selectedStatus.value == 'true';

  const params = {
    equipmentIds: equipmentIds,
    isActive: isActiveBoolean,
  };

  // @ts-ignore
  callUpdateEquipment(params);
  emit('updated');
};
</script>
