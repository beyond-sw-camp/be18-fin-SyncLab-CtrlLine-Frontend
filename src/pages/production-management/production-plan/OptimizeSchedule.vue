<template>
  <div class="border rounded-lg bg-gray-50 relative">
    <div class="flex items-center justify-between w-full px-4 py-3 text-sm font-medium">
      <span>스케줄 최적화</span>
      <Switch :model-value="enabled" @update:model-value="toggle" />
    </div>

    <div v-show="enabled" class="px-4 py-4 border-t">
      <p class="text-sm text-gray-600 mb-4">
        선택한 라인의 일정을 최적화한 결과입니다. 아래 미리보기를 확인한 뒤
        <span class="font-semibold">[최적화 적용]</span> 버튼을 눌러야 실제 일정에 반영됩니다.
      </p>

      <div v-if="isLoadingPreview" class="flex justify-center py-6">
        <Spinner />
      </div>

      <ejs-schedule
        v-else-if="previewEvents.length > 0"
        ref="scheduleRef"
        :selectedDate="previewEvents[0].StartTime"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek']"
        currentView="TimelineDay"
        :eventSettings="previewEventSettings"
        :resources="previewLineResource"
        :group="{ resources: ['Line'] }"
        :eventRendered="onEventRendered"
        :eventClick="onEventClick"
        :popupOpen="onPopupOpen"
      />

      <p v-else class="text-gray-400 text-sm py-6 text-center">최적화 결과가 없습니다.</p>

      <ScheduleTooltip v-if="tooltip.show" :tooltip="tooltip" @close="tooltip.show = false" />

      <div class="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" @click="toggle(false)">취소</Button>

        <Button
          size="sm"
          class="bg-primary text-white hover:bg-primary-600"
          :disabled="!previewData?.previewKey || isApplying"
          @click="apply"
        >
          {{ isApplying ? '적용 중...' : '최적화 적용' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ScheduleComponent as EjsSchedule,
  TimelineViews,
  Day,
  Week,
  TimelineMonth,
} from '@syncfusion/ej2-vue-schedule';
import { ref, computed, provide } from 'vue';

import useCreateProductionPlanOptimize from '@/apis/query-hooks/production-plan/useCreateProductionPlanOptimize';
import useCreateProductionPlanOptimizePreview from '@/apis/query-hooks/production-plan/useCreateProductionPlanOptimizePreview copy';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { DETAIL_HIGHLIGHT, STATUS_COLORS } from '@/constants/productionPlanStatus';
import ScheduleTooltip from '@/pages/production-management/production-plan/ScheduleTooltip.vue';

provide('schedule', [TimelineViews, Day, Week, TimelineMonth]);

const props = defineProps({
  lineCode: { type: String, required: true },
  productionPlanDetailId: Number,
});

const enabled = ref(false);
const previewData = ref(null);
const tooltip = ref({ show: false, x: 0, y: 0, data: null });

const { mutate: loadPreview, isPending: isLoadingPreview } =
  useCreateProductionPlanOptimizePreview();

const { mutate: applyOptimize, isPending: isApplying } = useCreateProductionPlanOptimize(
  props.lineCode,
);

function toggle(value) {
  enabled.value = value;

  if (value) {
    loadPreview(props.lineCode, {
      onSuccess: data => {
        previewData.value = data;
      },
    });
  } else {
    previewData.value = null;
    tooltip.value.show = false;
  }
}

function apply() {
  if (!previewData.value?.previewKey) return;

  applyOptimize(previewData.value.previewKey, {
    onSuccess: () => {
      enabled.value = false;
      previewData.value = null;
      tooltip.value.show = false;
    },
  });
}

const previewEvents = computed(() => {
  if (!previewData.value?.plans) return [];
  return previewData.value.plans.map(p => ({
    Id: p.planId,
    Subject: p.documentNo,
    StartTime: new Date(p.optimizedStartTime),
    EndTime: new Date(p.optimizedEndTime),
    Line: previewData.value.lineCode,
    Status: p.planStatus,
    ItemName: p.itemName,
    ItemQty: p.plannedQty,
  }));
});

const previewLineResource = computed(() => [
  {
    field: 'Line',
    name: 'Line',
    idField: 'Line',
    textField: 'text',
    dataSource: previewData.value
      ? [{ Line: previewData.value.lineCode, text: `${previewData.value.lineCode}` }]
      : [],
  },
]);

const previewEventSettings = computed(() => ({
  dataSource: previewEvents.value,
  fields: {
    id: 'Id',
    subject: { name: 'Subject' },
    startTime: { name: 'StartTime' },
    endTime: { name: 'EndTime' },
  },
}));

function onEventRendered(args) {
  const ev = args.data;

  if (props.productionPlanDetailId && ev.Id === props.productionPlanDetailId) {
    args.element.style.setProperty('background', DETAIL_HIGHLIGHT.background, 'important');
    args.element.style.setProperty('border-color', DETAIL_HIGHLIGHT.border, 'important');
    args.element.style.setProperty('color', DETAIL_HIGHLIGHT.text, 'important');
    return;
  }

  const color = STATUS_COLORS[ev.Status];
  if (color) {
    args.element.style.setProperty('background', color.background, 'important');
    args.element.style.setProperty('border-color', color.border, 'important');
    args.element.style.setProperty('color', color.text, 'important');
  }
}

function onEventClick(args) {
  const el = args.element;
  const rect = el.getBoundingClientRect();
  const width = 256;
  const gap = 10;

  const wrap = document.querySelector('.e-schedule .e-content-wrap');
  const scrollTop = wrap.scrollTop;
  const scheduleTop = wrap.getBoundingClientRect().top;

  let x = rect.right - width;
  while (x > 700) x = x / 1.5;

  const y = rect.bottom - scheduleTop + scrollTop - gap * 2;

  tooltip.value = { show: true, x, y, data: args.event };
}

function onPopupOpen(args) {
  if (args.type === 'QuickInfo' || args.type === 'Editor') args.cancel = true;
}
</script>

<style scoped></style>
