<template>
  <div
    id="schedule-tooltip"
    v-if="tooltip.show"
    class="absolute z-50 w-64 rounded-xl bg-white shadow-lg border p-4 space-y-3"
    :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    @mousedown.stop
  >
    <div
      class="text-lg font-semibold text-blue-600 underline cursor-pointer"
      @click="openDetailPage"
    >
      {{ tooltip.data.Subject }}
    </div>

    <div class="text-sm text-gray-700">
      {{ tooltip.data.ItemName }}
    </div>

    <div class="flex justify-between text-sm text-gray-700">
      <span class="text-gray-500">수량</span>
      <span class="font-medium text-gray-800">{{ tooltip.data.ItemQty }}</span>
    </div>

    <div class="space-y-1 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500">시작</span>
        <span class="font-medium text-gray-800">
          {{ formatDate(tooltip.data.StartTime, 'datetime') }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-500">종료</span>
        <span class="font-medium text-gray-800">
          {{ formatDate(tooltip.data.EndTime, 'datetime') }}
        </span>
      </div>
    </div>

    <div class="flex justify-between text-sm text-gray-700">
      <span class="text-gray-500">상태</span>
      <Badge :class="STATUS_CLASSES[tooltip.data.Status]" class="mt-1">
        {{ tooltip.data.Status }}
      </Badge>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

import { Badge } from '@/components/ui/badge';
import { STATUS_CLASSES } from '@/constants/productionPlanStatus';
import formatDate from '@/utils/formatDate';

const props = defineProps({
  tooltip: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

function handleGlobalClick(e) {
  if (!props.tooltip.show) return;

  const tooltipEl = document.getElementById('schedule-tooltip');
  if (!tooltipEl) return;

  // 클릭한 곳이 tooltip 영역 밖이면 닫기
  if (!tooltipEl.contains(e.target)) {
    emit('close');
  }
}

function openDetailPage() {
  const id = props.tooltip.data.Id;
  if (!id) return;

  window.open(`/production-management/production-plans/${id}`, '_blank');
}

onMounted(() => {
  window.addEventListener('mousedown', handleGlobalClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleGlobalClick);
});
</script>
