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

          <div class="mt-4 grid gap-2 lg:grid-cols-7">
            <div
              v-for="stageCode in STAGE_ORDER"
              :key="stageCode"
              class="rounded-2xl border border-slate-100 bg-slate-50 p-2"
            >
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span>{{ STAGE_LABELS[stageCode] }}</span>
                <span class="font-semibold text-slate-900">{{ stageCode }}</span>
              </div>

              <div class="mt-2 grid grid-cols-2 gap-2">
                <div
                  v-for="equipment in line.stageBuckets?.[stageCode] ?? []"
                  :key="equipment.equipmentId"
                  class="flex flex-col items-center gap-1 text-[11px]"
                >
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition-colors"
                    :style="{
                      backgroundColor: STATUS_COLORS[resolveStatusLevel(equipment, statusMap)],
                    }"
                    :title="`${STAGE_LABELS[stageCode]} · ${
                      STATUS_LABELS[resolveStatusLevel(equipment, statusMap)]
                    }`"
                  >
                    <span class="text-[10px] font-semibold text-slate-900">
                      {{ stageCode }}
                    </span>
                  </div>
                  <span class="text-[10px] text-slate-500">{{ equipment.equipmentCode }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>

    <CardFooter class="flex-col gap-2 text-sm">라인별 설비 상태</CardFooter>
  </Card>
</template>

<script setup>
import { unref } from 'vue';

import { STAGE_DEFINITIONS } from '@/apis/query-hooks/factory/useGetFactoryLinesWithEquipments';
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

const STAGE_ORDER = STAGE_DEFINITIONS.map(stage => stage.code);
const STAGE_LABELS = STAGE_DEFINITIONS.reduce((acc, stage) => {
  acc[stage.code] = stage.label;
  return acc;
}, {});

const STATUS_LEVEL_MAP = {
  STOPPED: 1,
  RUNNING: 2,
  LOW_WARNING: 3,
  HIGH_WARNING: 4,
};

const resolveStatusLevel = (equipment, statusMap) => {
  const map = unref(statusMap) || {};
  const code = equipment.equipmentCode;
  const id = equipment.equipmentId;
  const externalLevel =
    (code ? map[code] : undefined) ?? (id ? map[`#id:${id}`] : undefined);
  if (externalLevel !== undefined) {
    if (typeof externalLevel === 'number') return externalLevel;
    return STATUS_LEVEL_MAP[`${externalLevel}`.toUpperCase()] ?? equipment.status ?? 1;
  }
  if (equipment.status && STATUS_COLORS[equipment.status]) {
    return equipment.status;
  }
  if (equipment.status && STATUS_LEVEL_MAP[equipment.status]) {
    return STATUS_LEVEL_MAP[equipment.status];
  }
  return 1;
};

defineProps({
  lines: Object,
  statusMap: {
    type: Object,
    default: () => ({}),
  },
});
</script>
