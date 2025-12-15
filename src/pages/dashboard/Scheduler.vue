<template>
  <div class="relative">
    <ejs-schedule
      v-if="availableLineResource.length > 0"
      ref="availableScheduleRef"
      :selectedDate="selectedDateAvailable"
      width="100%"
      :views="['TimelineDay', 'TimelineWeek', 'TimelineMonth']"
      :current-view="'TimelineDay'"
      :eventSettings="availableEventSettings"
      :showCurrentTimeIndicator="true"
      :popupOpen="onPopupOpen"
      :group="groupOptions"
      :resources="availableLineResource"
      :created="onAvailableCreated"
      :eventRendered="onEventRendered"
      @actionComplete="onAvailableScheduleAction"
      :eventClick="onEventClick"
    />

    <ScheduleTooltip v-if="tooltip.show" :tooltip="tooltip" @close="tooltip.show = false" />
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
import { computed, nextTick, provide, ref, watch } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { STATUS_COLORS } from '@/constants/productionPlanStatus';
import { useScheduleRangeManager } from '@/hooks/useScheduleRangeManager';
import ScheduleTooltip from '@/pages/production-management/production-plan/ScheduleTooltip.vue';

provide('schedule', [TimelineViews, Day, Week, TimelineMonth]);

const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null,
});

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

  tooltip.value = {
    show: true,
    x,
    y,
    data: args.event,
  };
}

function onEventRendered(args) {
  const ev = args.data;

  // 일반 이벤트는 상태 컬러 적용
  const status = ev.Status;
  const color = STATUS_COLORS[status];
  if (!color) return;

  args.element.style.setProperty('background-color', color.background, 'important');
  args.element.style.setProperty('border-color', color.border, 'important');

  const subject = args.element.querySelector('.e-subject');
  if (subject) {
    subject.style.setProperty('color', color.text, 'important');
    subject.style.opacity = '1';
  }
}

const { data: lineListSchedule } = useGetLineList();

const availableLineResource = computed(() => [
  {
    field: 'LineCode',
    title: '라인',
    name: 'Lines',
    idField: 'LineCode',
    textField: 'text',
    dataSource:
      lineListSchedule.value?.content?.map(l => ({
        text: `${l.lineName} (${l.lineCode})`,
        LineCode: l.lineCode,
      })) ?? [],
  },
]);

const groupOptions = { resources: ['Lines'] };

const { data: availableLineData, filters: availableFilters } = useGetProductionPlanScheduleList();

const { selectedDate: selectedDateAvailable, onNavigation: onAvailableNavigation } =
  useScheduleRangeManager(availableFilters);

const makeEvent = ev => {
  return {
    Id: ev.id,
    Subject: ev.documentNo,
    StartTime: new Date(ev.startTime),
    EndTime: new Date(ev.actualEndTime ?? ev.endTime),
    LineCode: ev.lineCode,
    ItemName: ev.itemName,
    ItemQty: ev.plannedQty,
    Status: ev.status,
  };
};

const availableEvents = computed(() => availableLineData.value?.map(makeEvent) ?? []);

const availableEventSettings = computed(() => ({
  dataSource: [...availableEvents.value],
  resources: ['Lines'],
}));

const availableScheduleRef = ref(null);

watch(availableEvents, () => {
  nextTick(() => {
    availableScheduleRef.value?.ej2Instances?.refreshEvents();
  });
});

function onAvailableCreated() {
  const inst = availableScheduleRef.value?.ej2Instances;
  if (inst) onAvailableNavigation(inst);
}

function onAvailableScheduleAction(args) {
  // 기존의 dateNavigate/viewNavigate 로직은 유지하거나 제거
  if (['dateNavigate', 'viewNavigate'].includes(args.requestType)) {
    const inst = availableScheduleRef.value?.ej2Instances;
    if (inst) onAvailableNavigation(inst);
  }
}

function onPopupOpen(args) {
  if (args.type === 'QuickInfo' || args.type === 'Editor') {
    args.cancel = true;
  }
}
</script>

<style>
.e-schedule {
  overflow: visible !important;
}

/* 스크롤바 지정 */
.e-schedule .e-content-wrap::-webkit-scrollbar,
.e-schedule::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.e-schedule .e-content-wrap::-webkit-scrollbar-thumb,
.e-schedule::-webkit-scrollbar-thumb {
  background: gray;
  border-radius: 3px;
}

.e-schedule .e-content-wrap::-webkit-scrollbar-track,
.e-schedule::-webkit-scrollbar-track {
  background: transparent;
}

/* 막대바 높이 지정 */
.e-schedule .e-timeline-view .e-content-wrap tr,
.e-schedule .e-timeline-view .e-resource-column-wrap tr {
  height: 30px !important;
}

.e-appointment {
  height: 22px !important;
  border-radius: 12px !important;
}

.e-schedule .e-timeline-view .e-content-wrap,
.e-schedule .e-timeline-view .e-resource-column-wrap {
  height: auto !important;
}
</style>
