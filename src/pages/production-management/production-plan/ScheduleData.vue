<template>
  <div class="relative">
    <div>
      <Badge variant="secondary" class="mb-4">선택 라인</Badge>
      <ejs-schedule
        class="time-scale"
        :timeScale="optimizedTimeScaleOptions"
        :timezone="'Asia/Seoul'"
        v-if="props.lineCode && selectedLineResource.length > 0"
        ref="selectedScheduleRef"
        :selectedDate="selectedDateSelected"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek', 'TimelineMonth']"
        :current-view="'TimelineDay'"
        :eventSettings="selectedEventSettings"
        :showCurrentTimeIndicator="true"
        :popupOpen="onPopupOpen"
        :dragStart="onSelectedDragStart"
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
        :dragStart="onDragStart"
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
  DragAndDrop,
} from '@syncfusion/ej2-vue-schedule';
import { computed, nextTick, provide, ref, watch } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { Badge } from '@/components/ui/badge';
import { DETAIL_HIGHLIGHT, STATUS_COLORS } from '@/constants/productionPlanStatus';
import { useScheduleRangeManager } from '@/hooks/useScheduleRangeManager';
import ScheduleTooltip from '@/pages/production-management/production-plan/ScheduleTooltip.vue';
import { useUserStore } from '@/stores/useUserStore';

provide('schedule', [TimelineViews, Day, Week, TimelineMonth, DragAndDrop]);

const optimizedTimeScaleOptions = {
  enable: true,
  interval: 15, // 15분마다 시간 라벨 표시
  slotCount: 15, // 15분 / 15 = 1분 단위 스냅
};

const props = defineProps({
  factoryId: Number,
  factoryCode: String,
  lineCode: String,
  productionPlanDetailId: Number,
  mode: {
    type: String,
    default: 'detail',
  },
  draftStartTime: String,
  draftEndTime: String,
  draftItem: Object,
  draftQty: Number,
  updatedStartTime: String,
  updatedEndTime: String,
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

  tooltip.value = {
    show: true,
    x,
    y,
    data: args.event,
  };
}

const draftEvent = computed(() => {
  if (
    props.mode !== 'create' ||
    !props.lineCode ||
    !props.draftStartTime ||
    !props.draftEndTime ||
    !props.draftItem ||
    !props.draftQty
  ) {
    return null;
  }

  return {
    Id: 'draft', // 임시 ID
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

  // 신규 등록 시
  if (ev.Id === 'draft') {
    args.element.style.setProperty('background-color', 'var(--primary)', 'important');
    args.element.style.setProperty('border-color', 'var(--primary)', 'important');

    const subject = args.element.querySelector('.e-subject');
    if (subject) {
      subject.style.setProperty('color', 'white', 'important');
      subject.style.opacity = '1';
    }
    return; // 아래 status 로직은 진행 X
  }

  // 상세 조회 중인 이벤트인 경우
  if (props.productionPlanDetailId && ev.Id === props.productionPlanDetailId) {
    args.element.style.setProperty('background-color', DETAIL_HIGHLIGHT.background, 'important');
    args.element.style.setProperty('border-color', DETAIL_HIGHLIGHT.border, 'important');

    const subject = args.element.querySelector('.e-subject');
    if (subject) {
      subject.style.setProperty('color', DETAIL_HIGHLIGHT.text, 'important');
      subject.style.opacity = '1';
    }
    return; // 상태 컬러 스킵
  }

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

const emit = defineEmits(['updateStartEndTime']);

const { data: lineListSchedule } = useGetLineList({
  factoryId: computed(() => props.factoryId),
});

const selectedLine = computed(() => {
  return lineListSchedule.value?.content?.find(l => l.lineCode === props.lineCode);
});

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

const selectedLineResource = computed(() => {
  if (!selectedLine.value) return [];
  return [
    {
      field: 'LineCode',
      title: '라인',
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

const { selectedDate: selectedDateSelected, onNavigation: onSelectedNavigation } =
  useScheduleRangeManager(selectedFilters);

const { selectedDate: selectedDateAvailable, onNavigation: onAvailableNavigation } =
  useScheduleRangeManager(availableFilters);

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
  const base = selectedLineData.value?.map(makeEvent) ?? [];
  if (props.mode === 'create' && draftEvent.value && props.lineCode) {
    base.push(draftEvent.value);
  }
  return base;
});

const availableEvents = computed(() => {
  const base = availableLineData.value?.map(makeEvent) ?? [];
  if (props.mode === 'create' && draftEvent.value && props.lineCode) {
    base.push(draftEvent.value);
  }
  return base;
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

watch(selectedEvents, () => {
  nextTick(() => {
    selectedScheduleRef.value?.ej2Instances?.refreshEvents();
  });
});

watch(availableEvents, () => {
  nextTick(() => {
    availableScheduleRef.value?.ej2Instances?.refreshEvents();
  });
});

function onSelectedCreated() {
  const inst = selectedScheduleRef.value?.ej2Instances;
  if (inst) onSelectedNavigation(inst);
}

function onAvailableCreated() {
  const inst = availableScheduleRef.value?.ej2Instances;
  if (inst) onAvailableNavigation(inst);
}

const isProgrammaticUpdate = ref(false);
const originalStartTime = ref(null);

function applyEventToSchedules(ev) {
  const selectedInst = selectedScheduleRef.value?.ej2Instances;
  const availableInst = availableScheduleRef.value?.ej2Instances;

  if (selectedInst) selectedInst.saveEvent(ev);
  if (availableInst) availableInst.saveEvent(ev);
}

function handleEventOrderChange(draggedEvent) {
  const lineCode = props.lineCode;
  if (!lineCode) return;

  // 현재 라인의 이벤트들 복사 (draft 제외)
  let events = selectedEvents.value
    .filter(e => e.LineCode === lineCode && e.Id !== 'draft')
    .map(e => ({
      ...e,
      StartTime: new Date(e.StartTime),
      EndTime: new Date(e.EndTime),
    }));

  if (!events.length) return;

  // 드래그 전 원본 가장 이른 시작 시간
  const originalEarliestMs = Math.min(...events.map(e => e.StartTime.getTime()));

  // 드래그된 이벤트 찾기
  const draggedIndex = events.findIndex(e => e.Id === draggedEvent.Id);
  if (draggedIndex === -1) return;

  const newStartMs = new Date(draggedEvent.StartTime).getTime();
  const newEndMs = new Date(draggedEvent.EndTime).getTime();
  const dragDuration = newEndMs - newStartMs;

  // 어떤 이벤트도 기준 시간보다 앞으론 못 가게 조정
  const effectiveStartMs = newStartMs < originalEarliestMs ? originalEarliestMs : newStartMs;
  const effectiveEndMs = effectiveStartMs + dragDuration;

  events[draggedIndex].StartTime = new Date(effectiveStartMs);
  events[draggedIndex].EndTime = new Date(effectiveEndMs);

  // 새 시작 시간을 기준으로 순서 재정렬
  events.sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime());

  // 전체 타임라인은 항상 originalEarliestMs 에서 시작
  let currentStart = new Date(originalEarliestMs);
  let updatedCurrentEvent = null;

  isProgrammaticUpdate.value = true;
  try {
    for (const ev of events) {
      const durationMs = ev.EndTime.getTime() - ev.StartTime.getTime();

      ev.StartTime = new Date(currentStart);
      ev.EndTime = new Date(currentStart.getTime() + durationMs);
      currentStart = new Date(ev.EndTime);

      applyEventToSchedules(ev);

      if (ev.Id === draggedEvent.Id) {
        updatedCurrentEvent = ev;
      }
    }
  } finally {
    isProgrammaticUpdate.value = false;
  }

  // draggedEvent 에도 최종 시간 반영 (emit 용)
  if (updatedCurrentEvent) {
    draggedEvent.StartTime = updatedCurrentEvent.StartTime;
    draggedEvent.EndTime = updatedCurrentEvent.EndTime;
  }
}

function onSelectedScheduleAction(args) {
  if (isProgrammaticUpdate.value) return;

  if (args.requestType === 'eventChanged') {
    const updatedEvents = args.changedRecords ?? [];

    updatedEvents.forEach(draggedEvent => {
      if (
        draggedEvent &&
        props.mode === 'detail' &&
        draggedEvent.Id === props.productionPlanDetailId
      ) {
        handleEventOrderChange(draggedEvent);

        // 여기서 ±1초 보정하는 emitEvent 로직도 그대로 사용
        let deltaSec = 0;
        if (originalStartTime.value) {
          const prev = originalStartTime.value.getTime();
          const now = new Date(draggedEvent.StartTime).getTime();
          if (now > prev)
            deltaSec = 1; // 오른쪽
          else if (now < prev) deltaSec = -1; // 왼쪽
        }
        const deltaMs = deltaSec * 1000;

        const emitEvent = {
          ...draggedEvent,
          StartTime: new Date(new Date(draggedEvent.StartTime).getTime() + deltaMs),
          EndTime: new Date(new Date(draggedEvent.EndTime).getTime() + deltaMs),
        };

        originalStartTime.value = null;
        emit('updateStartEndTime', emitEvent);
      }
    });

    nextTick(() => {
      selectedScheduleRef.value?.ej2Instances?.refreshEvents();
      availableScheduleRef.value?.ej2Instances?.refreshEvents();
    });
  }
}

function onAvailableScheduleAction(args) {
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

function onSelectedDragStart(args) {
  if (args.data.Id !== props.productionPlanDetailId) {
    args.cancel = true;
    return;
  }

  originalStartTime.value = new Date(args.data.StartTime);
}

function onDragStart(args) {
  args.cancel = true;
}

function reorderEventsAfterTimeChange(changedEventId, newStartTime, newEndTime) {
  const lineCode = props.lineCode;
  if (!lineCode) return;

  // 현재 라인의 모든 이벤트 복사 (draft 제외)
  let events = selectedEvents.value
    .filter(e => e.LineCode === lineCode && e.Id !== 'draft')
    .map(e => ({
      ...e,
      StartTime: new Date(e.StartTime),
      EndTime: new Date(e.EndTime),
    }));

  if (!events.length) return;

  // 변경된 이벤트 찾기
  const changedIndex = events.findIndex(e => e.Id === changedEventId);
  if (changedIndex === -1) return;

  // 변경된 이벤트의 시간 업데이트
  events[changedIndex].StartTime = new Date(newStartTime);
  events[changedIndex].EndTime = new Date(newEndTime);

  // 시작 시간 기준으로 정렬
  events.sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime());

  // 가장 이른 시작 시간 찾기
  const earliestMs = Math.min(...events.map(e => e.StartTime.getTime()));

  // 전체 타임라인 재정렬
  let currentStart = new Date(earliestMs);

  isProgrammaticUpdate.value = true;
  try {
    for (const ev of events) {
      const durationMs = ev.EndTime.getTime() - ev.StartTime.getTime();

      ev.StartTime = new Date(currentStart);
      ev.EndTime = new Date(currentStart.getTime() + durationMs);
      currentStart = new Date(ev.EndTime);

      applyEventToSchedules(ev);
    }
  } finally {
    isProgrammaticUpdate.value = false;
  }

  // 스케줄 새로고침
  nextTick(() => {
    selectedScheduleRef.value?.ej2Instances?.refreshEvents();
    availableScheduleRef.value?.ej2Instances?.refreshEvents();
  });
}

watch(
  () => [props.updatedStartTime, props.updatedEndTime, props.productionPlanDetailId],
  ([newStartTime, newEndTime, planId]) => {
    if (props.mode === 'detail' && planId && newStartTime && newEndTime) {
      // 시간이 실제로 변경되었는지 확인
      const currentEvent = selectedEvents.value.find(e => e.Id === planId);
      if (currentEvent) {
        const currentStart = new Date(currentEvent.StartTime).getTime();
        const currentEnd = new Date(currentEvent.EndTime).getTime();
        const newStart = new Date(newStartTime).getTime();
        const newEnd = new Date(newEndTime).getTime();

        // 시간이 변경된 경우에만 재정렬
        if (currentStart !== newStart || currentEnd !== newEnd) {
          reorderEventsAfterTimeChange(planId, newStartTime, newEndTime);
        }
      }
    }
  },
  { deep: true },
);
</script>

<style>
.e-schedule {
  overflow: visible !important;
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

.time-scale.e-schedule .e-header-row .e-time-slots {
  display: none !important;
}
</style>
