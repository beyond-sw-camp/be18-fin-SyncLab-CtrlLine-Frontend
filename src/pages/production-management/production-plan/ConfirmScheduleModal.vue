<template>
  <Dialog :open="visible" @update:open="$emit('cancel')">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold">생산 계획 조정 결과 확인 </DialogTitle>
        <DialogDescription>
          생산 계획 변경으로 인해 기존 일정의 시작 시간이 조정되었습니다. 아래 목록을 확인하시고,
          납기일자 초과 건에 대해 유의해주세요.
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="dueDateExceededPlans.length"
        class="space-y-3 p-4 border border-red-500 rounded-lg bg-red-50"
      >
        <h4 class="font-semibold text-lg text-red-600 flex items-center gap-2">
          <AlertTriangleIcon class="w-5 h-5" />
          납기일자 초과 경고 ({{ dueDateExceededPlans.length }} 건)
        </h4>
        <p class="text-sm text-red-600">
          다음 일정들은 조정된 종료 시각이 기존 납기일자를 초과합니다. 이대로 진행하면 납기가
          지연됩니다.
        </p>

        <div class="max-h-[250px] overflow-y-auto">
          <Table class="w-full">
            <TableHeader class="bg-red-100 sticky top-0">
              <TableRow>
                <TableHead class="w-[100px] text-center">ID</TableHead>
                <TableHead class="text-center">새 종료 시각</TableHead>
                <TableHead class="text-center">납기일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="plan in dueDateExceededPlans" :key="plan.id">
                <TableCell class="font-medium text-center">{{ plan.id }}</TableCell>
                <TableCell class="text-center text-red-600 font-medium">
                  {{ formatDateTime(plan.newEndTime) }}
                </TableCell>
                <TableCell class="text-center">
                  {{ formatDateTime(plan.dueDateLimit, 'date') }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div class="space-y-3 mt-4">
        <h4 class="font-semibold text-lg">영향 받은 전체 일정 ({{ affectedPlans.length }} 건)</h4>

        <div class="max-h-[300px] overflow-y-auto border rounded">
          <Table class="w-full text-sm">
            <TableHeader class="sticky top-0 bg-gray-50">
              <TableRow>
                <TableHead class="w-20 text-center">ID</TableHead>
                <TableHead class="w-[200px] text-center">이전 시작 시각</TableHead>
                <TableHead class="w-[200px] text-center">새 종료 시각</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="plan in affectedPlans" :key="plan.id">
                <TableCell class="font-medium text-center">{{ plan.id }}</TableCell>
                <TableCell class="text-center">
                  {{ formatDateTime(plan.oldStartTime) }}
                </TableCell>
                <TableCell class="text-center font-medium">
                  {{ formatDateTime(plan.newEndTime) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <DialogFooter class="flex justify-end gap-2 pt-4">
        <Button variant="outline" @click="$emit('cancel')">취소</Button>
        <Button variant="default" @click="$emit('confirm')"> 확인 및 최종 수정 </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { AlertTriangleIcon } from 'lucide-vue-next';
import { computed } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import formatDate from '@/utils/formatDate';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  affectedPlansData: {
    type: Object,
    required: true,
    default: () => ({ affectedPlans: [], dueDateExceededPlans: [] }),
  },
});

defineEmits(['confirm', 'cancel']);

// 데이터 정제
const affectedPlans = computed(() => props.affectedPlansData?.affectedPlans || []);
const dueDateExceededPlans = computed(() => props.affectedPlansData?.dueDateExceededPlans || []);

// 날짜 포맷팅 헬퍼 함수
const formatDateTime = (isoString, type = 'datetime') => {
  if (!isoString) return '-';
  // ISO 문자열을 받아 원하는 형식으로 포맷하는 유틸리티 함수를 사용합니다.
  return formatDate(isoString, type);
};
</script>
