<template>
  <div class="relative">
    <div>
      <Badge variant="secondary" class="mb-4">선택 라인</Badge>
      <ejs-schedule
        class="time-scale"
        :timeScale="optimizedTimeScaleOptions"
        v-if="props.lineCode && selectedLineResource.length > 0"
        ref="selectedScheduleRef"
        :selectedDate="selectedDateSelected"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek', 'TimelineMonth']"
        :current-view="'TimelineDay'"
        :eventSettings="selectedEventSettings"
        :showCurrentTimeIndicator="true"
        :popupOpen="onPopupOpen"
        :group="groupOptions"
        :resources="selectedLineResource"
        :created="onSelectedCreated"
        :eventRendered="onEventRendered"
        @actionComplete="onSelectedScheduleAction"
        :eventClick="onEventClick"
      />
    </div>

    <div>
      <Badge variant="secondary" class="mb-4 mt-6">선택 가능한 라인</Badge>
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
    </div>

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
import { computed, provide, ref } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/constants/productionPlanStatus';
import { useScheduleRangeManager } from '@/hooks/useScheduleRangeManager';
import ScheduleTooltip from '@/pages/production-management/production-plan/ScheduleTooltip.vue';
import { useUserStore } from '@/stores/useUserStore';

provide('schedule', [TimelineViews, Day, Week, TimelineMonth]);

// 타임라인 스케일 설정
const optimizedTimeScaleOptions = {
  enable: true,
  interval: 15,
  slotCount: 15,
};

const props = defineProps({
  factoryId: Number,
  factoryCode: String,
  lineCode: String,
  draftStartTime: String,
  draftEndTime: String,
  draftItem: Object,
  draftQty: Number,
  isEmergent: Boolean,
});

const userStore = useUserStore();

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

  tooltip.value = { show: true, x, y, data: args.event };
}

const draftEvent = computed(() => {
  if (
    !props.lineCode ||
    !props.draftStartTime ||
    !props.draftEndTime ||
    !props.draftItem ||
    !props.draftQty
  )
    return null;

  return {
    Id: 'draft',
    Subject: '신규 생산계획',
    StartTime: new Date(props.draftStartTime),
    EndTime: new Date(props.draftEndTime),
    LineCode: props.lineCode,
    ItemName: props.draftItem.itemName,
    ItemQty: props.draftQty,
    Status: userStore.userRole === 'ADMIN' ? 'CONFIRMED' : 'PENDING',
  };
});

function onEventRendered(args) {
  const ev = args.data;

  // 신규 draft 이벤트
  if (ev.Id === 'draft' || ev.Id === 'draft-modified') {
    args.element.style.setProperty('background-color', 'var(--primary)', 'important');
    args.element.style.setProperty('border-color', 'var(--primary)', 'important');
    args.element.style.setProperty('color', 'white', 'important');
    return;
  }

  // 일반 상태 컬러 적용
  const color = STATUS_COLORS[ev.Status];
  if (color) {
    args.element.style.setProperty('background-color', color.background, 'important');
    args.element.style.setProperty('border-color', color.border, 'important');
    args.element.style.setProperty('color', color.text, 'important');
  }
}

const { data: lineListSchedule } = useGetLineList({
  factoryId: computed(() => props.factoryId),
});

const selectedLine = computed(() =>
  lineListSchedule.value?.content?.find(l => l.lineCode === props.lineCode),
);

const availableLineResource = computed(() => [
  {
    field: 'LineCode',
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

const selectedLineResource = computed(() => {
  if (!selectedLine.value) return [];
  return [
    {
      field: 'LineCode',
      name: 'Lines',
      idField: 'LineCode',
      textField: 'text',
      dataSource: [
        {
          text: `${selectedLine.value.lineName} (${selectedLine.value.lineCode})`,
          LineCode: selectedLine.value.lineCode,
        },
      ],
    },
  ];
});

const groupOptions = { resources: ['Lines'] };

const { data: availableLineData, filters: availableFilters } = useGetProductionPlanScheduleList({
  factoryCode: props.factoryCode,
  lineCode: null,
});

const { data: selectedLineData, filters: selectedFilters } = useGetProductionPlanScheduleList({
  factoryCode: props.factoryCode,
  lineCode: props.lineCode,
});

// 날짜 이동
const { selectedDate: selectedDateSelected, onNavigation: onSelectedNavigation } =
  useScheduleRangeManager(selectedFilters);

const { selectedDate: selectedDateAvailable, onNavigation: onAvailableNavigation } =
  useScheduleRangeManager(availableFilters);

// 이벤트 포맷
const makeEvent = ev => {
  return {
    Id: ev.id,
    Subject: ev.documentNo,
    StartTime: new Date(ev.startTime),
    EndTime: new Date(ev.endTime),
    LineCode: ev.lineCode,
    ItemName: ev.itemName,
    ItemQty: ev.plannedQty,
    Status: ev.status,
  };
};

const selectedEvents = computed(() => {
  const baseEvents = selectedLineData.value?.map(makeEvent) ?? [];
  const draft = draftEvent.value;

  if (draft) {
    return [...baseEvents, draft];
  }

  return baseEvents;
});

const availableEvents = computed(() => {
  const baseEvents = availableLineData.value?.map(makeEvent) ?? [];
  const draft = draftEvent.value;

  if (draft) {
    return [...baseEvents, draft];
  }

  return baseEvents;
});

const selectedEventSettings = computed(() => ({
  dataSource: [...selectedEvents.value],
  resources: ['Lines'],
}));

const availableEventSettings = computed(() => ({
  dataSource: [...availableEvents.value],
  resources: ['Lines'],
}));

const selectedScheduleRef = ref(null);
const availableScheduleRef = ref(null);

function onSelectedCreated() {
  const inst = selectedScheduleRef.value?.ej2Instances;
  if (inst) onSelectedNavigation(inst);
}

function onAvailableCreated() {
  const inst = availableScheduleRef.value?.ej2Instances;
  if (inst) onAvailableNavigation(inst);
}

function onSelectedScheduleAction(args) {
  if (['dateNavigate', 'viewNavigate'].includes(args.requestType)) {
    const inst = selectedScheduleRef.value?.ej2Instances;
    if (inst) onSelectedNavigation(inst);
  }
}

function onAvailableScheduleAction(args) {
  if (['dateNavigate', 'viewNavigate'].includes(args.requestType)) {
    const inst = availableScheduleRef.value?.ej2Instances;
    if (inst) onAvailableNavigation(inst);
  }
}

function onPopupOpen(args) {
  if (args.type === 'QuickInfo' || args.type === 'Editor') args.cancel = true;
}
</script>

<style>
.e-schedule {
  overflow: visible !important;
}

/* 스크롤바 지정 */
.e-schedule .e-content-wrap::-webkit-scrollbar,
.e-schedule::-webkit-scrollbar {
  width: 2px; /* 원하는 너비로 설정하여 얇게 만듭니다. */
  height: 2px;
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

/* 시간축 간격 줄이기 */
.time-scale.e-schedule.e-device .e-vertical-view .e-left-indent,
.time-scale.e-schedule.e-device .e-vertical-view .e-time-cells-wrap {
  width: 50px !important;
}

.time-scale.e-schedule .e-timeline-view .e-date-header-wrap table col,
.time-scale.e-schedule .e-timeline-view .e-content-wrap table col {
  width: 2px !important;
}

.time-scale.e-schedule .e-header-row .e-time-slots span {
  display: block;
  white-space: normal;
  word-wrap: break-word;
  font-size: 8px;
  width: 20px;
  height: 30px;
}
</style>
