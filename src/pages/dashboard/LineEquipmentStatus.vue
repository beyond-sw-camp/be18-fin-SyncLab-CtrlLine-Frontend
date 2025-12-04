<template>
  <Card class="flex w-full">
    <CardContent class="flex-1 pb-0 overflow-x-auto">
      <div class="flex flex-wrap gap-3 pb-4 text-xs text-muted-foreground">
        <div v-for="status in STATUS_OPTIONS" :key="status.value" class="flex items-center gap-2">
          <span
            class="h-3 w-3 rounded-sm border border-border"
            :style="{ backgroundColor: STATUS_COLORS[status.value] }"
          ></span>
          <span>{{ status.label }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="line in lines.lines" :key="line.lineId" class="flex items-center gap-3">
          <div class="w-20 font-medium">{{ line.lineCode }}</div>

          <div class="flex flex-1 gap-0.5">
            <div
              v-for="(eq, index) in line.equipments"
              :key="eq.equipmentId"
              class="flex items-center justify-center border text-sm font-medium rounded-sm w-full"
              :title="STATUS_LABELS[eq.status]"
              :style="{
                maxHeight: '26px',
                backgroundColor: STATUS_COLORS[eq.status],
              }"
            >
              {{ index + 1 }}
            </div>
          </div>
        </div>
      </div>
    </CardContent>

    <CardFooter class="flex-col gap-2 text-sm">라인별 설비 상태</CardFooter>
  </Card>
</template>

<script setup>
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const STATUS_COLORS = {
  1: '#B0B0B0', // Idle / 정지중
  2: '#5E8F44', // Running
  3: '#F2D16B', // Low warning
  4: '#C0392B', // High warning
};

const STATUS_LABELS = {
  1: '정지중',
  2: '가동중',
  3: 'Low Warning',
  4: 'High Warning',
};

const STATUS_OPTIONS = [
  { value: 1, label: '정지중' },
  { value: 2, label: '가동중' },
  { value: 3, label: 'Low Warning' },
  { value: 4, label: 'High Warning' },
];

defineProps({
  lines: Object,
});
</script>
