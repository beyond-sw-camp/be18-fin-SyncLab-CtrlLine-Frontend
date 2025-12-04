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

      <div class="grid gap-4">
        <div
          v-for="line in lines.lines"
          :key="line.lineId"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900">
                {{ line.lineName || line.lineCode }}
              </p>
              <p class="text-xs text-muted-foreground">{{ line.lineCode }}</p>
            </div>
            <div class="text-xs text-muted-foreground">
              총 {{ line.equipments.length }}대
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-3">
            <div
              v-for="equipment in line.equipments"
              :key="equipment.equipmentId"
              class="flex flex-col items-center gap-1 text-[11px]"
            >
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-colors"
                :style="{ backgroundColor: STATUS_COLORS[equipment.status] }"
                :title="`${equipment.label ?? 'Stage'} · ${STATUS_LABELS[equipment.status]}`"
              >
                <span class="text-xs font-semibold text-slate-900">
                  {{ equipmentIconLabel(equipment) }}
                </span>
              </div>
              <span class="text-slate-600">{{ equipment.equipmentCode }}</span>
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

const equipmentIconLabel = equipment => {
  if (equipment.code) {
    return equipment.code;
  }
  const code = equipment.equipmentCode ?? '';
  if (!code) return 'E';
  return code.slice(-2);
};

defineProps({
  lines: Object,
});
</script>
