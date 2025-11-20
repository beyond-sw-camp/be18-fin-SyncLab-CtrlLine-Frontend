<template>
  <Card class="flex w-full">
    <CardContent class="flex-1 pb-0 overflow-x-auto">
      <div class="flex flex-col gap-3">
        <div v-for="line in lines.lines" :key="line.lineId" class="flex items-center gap-3">
          <div class="w-20 font-medium">{{ line.lineCode }}</div>

          <div class="flex flex-1 gap-0.5">
            <div
              v-for="(eq, index) in line.equipments"
              :key="eq.equipmentId"
              class="flex items-center justify-center border text-sm font-medium rounded-sm w-full"
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
  0: '#D9D9D9',
  1: '#F2D16B',
  2: '#5E8F44',
  3: '#C0392B',
};

defineProps({
  lines: Object,
});
</script>
