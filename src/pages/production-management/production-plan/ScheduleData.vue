<template>
  <div class="relative">
    <div>
      <Badge variant="secondary" class="mb-4">선택 라인</Badge>
      <ejs-schedule
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

provide('schedule', [TimelineViews, Day, Week, TimelineMonth, DragAndDrop]);

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

const props = defineProps({
  factoryId: Number,
  factoryCode: String,
  lineCode: String,
  productionPlanDetailId: Number,
  mode: {
    type: String,
    default: 'detail',
  },
});

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

const selectedEvents = computed(() => selectedLineData.value?.map(makeEvent) ?? []);

const availableEvents = computed(() => availableLineData.value?.map(makeEvent) ?? []);

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

const hasPushed = ref(false);

function onSelectedScheduleAction(args) {
  // 드래그앤드롭 후 시간 변경 처리
  if (args.requestType === 'eventChanged') {
    const updatedEvents = args.changedRecords;

    updatedEvents.forEach(draggedEvent => {
      // 드래그 가능한 이벤트인지 확인
      if (
        draggedEvent &&
        props.mode === 'detail' &&
        draggedEvent.Id === props.productionPlanDetailId
      ) {
        // 충돌 처리 로직 호출
        processEventPushLogic(draggedEvent); // 새로운 함수 호출

        // 선택된 라인 이벤트 업데이트 및 상위 컴포넌트 알림
        emit('updateStartEndTime', draggedEvent);
      }
    });

    nextTick(() => {
      selectedScheduleRef.value?.ej2Instances?.refreshEvents();
      availableScheduleRef.value?.ej2Instances?.refreshEvents();
    });
  }
}

function processEventPushLogic(draggedEvent) {
  let eventsToUpdate = [...selectedEvents.value];

  // 드래그된 이벤트의 정보를 복사본에서 찾아서 업데이트
  const draggedIndex = eventsToUpdate.findIndex(e => e.Id === draggedEvent.Id);
  if (draggedIndex > -1) {
    eventsToUpdate[draggedIndex].StartTime = draggedEvent.StartTime;
    eventsToUpdate[draggedIndex].EndTime = draggedEvent.EndTime;
  }

  // 드래그된 이벤트의 변경사항을 로컬 상태에 반영
  updateLocalEventData(draggedEvent);

  // 이벤트들을 시작 시간 순서로 정렬 (충돌 검사 기준)
  eventsToUpdate.sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime());

  // 이벤트 배열을 순회하며 충돌 검사 및 밀어내기
  for (let i = 0; i < eventsToUpdate.length - 1; i++) {
    const currentEvent = eventsToUpdate[i];
    const nextEvent = eventsToUpdate[i + 1];

    // 충돌 조건: 현재 이벤트가 다음 이벤트의 시작 시간 이후에 끝나는 경우
    if (currentEvent.EndTime.getTime() > nextEvent.StartTime.getTime()) {
      // 다음 이벤트(nextEvent)를 현재 이벤트(currentEvent)의 끝나는 시간 직후로 이동
      const pushDuration = nextEvent.EndTime.getTime() - nextEvent.StartTime.getTime();

      const newStartTime = currentEvent.EndTime;
      const newEndTime = new Date(newStartTime.getTime() + pushDuration);

      // 이벤트 시간 업데이트
      nextEvent.StartTime = newStartTime;
      nextEvent.EndTime = newEndTime;

      hasPushed.value = true;

      // 업데이트된 시간 반영 (밀려난 이벤트만)
      updateLocalEventData(nextEvent);
    }
  }
}

function updateLocalEventData(updatedEvent) {
  // 선택된 라인 이벤트 목록 업데이트
  const selectedIndex = selectedEvents.value.findIndex(e => e.Id === updatedEvent.Id);
  if (selectedIndex > -1) {
    selectedEvents.value[selectedIndex].StartTime = updatedEvent.StartTime;
    selectedEvents.value[selectedIndex].EndTime = updatedEvent.EndTime;
  }

  // 선택 가능한 라인 이벤트 목록 업데이트 (동일한 라인 코드가 있을 경우)
  const availableIndex = availableEvents.value.findIndex(
    e => e.Id === updatedEvent.Id && e.LineCode === updatedEvent.LineCode,
  );

  if (availableIndex > -1) {
    availableEvents.value[availableIndex].StartTime = updatedEvent.StartTime;
    availableEvents.value[availableIndex].EndTime = updatedEvent.EndTime;
  }
}

function onAvailableScheduleAction(args) {
  if (
    !['dateNavigate', 'viewNavigate'].includes(args.requestType) &&
    args.requestType !== 'eventChanged'
  )
    return;

  if (args.requestType === 'eventChanged') {
    const updatedEvents = args.changedRecords;

    updatedEvents.forEach(draggedEvent => {
      if (draggedEvent && draggedEvent.LineCode) {
        // 해당 라인에 대한 충돌 처리 로직 호출
        // availableEvents 기반으로 밀어내기 로직을 수행하는 새로운 함수 호출 필요
        const changedEvents = processAvailableLinePushLogic(draggedEvent);

        // 변경된 모든 이벤트를 로컬 데이터 원본에 반영
        changedEvents.forEach(event => {
          updateLocalEventData(event);
        });
      }
    });

    // 두 스케줄러 모두 새로고침
    nextTick(() => {
      selectedScheduleRef.value?.ej2Instances?.refreshEvents();
      availableScheduleRef.value?.ej2Instances?.refreshEvents();
    });
  }

  // 기존의 dateNavigate/viewNavigate 로직은 유지하거나 제거
  if (['dateNavigate', 'viewNavigate'].includes(args.requestType)) {
    const inst = availableScheduleRef.value?.ej2Instances;
    if (inst) onAvailableNavigation(inst);
  }
}

function processAvailableLinePushLogic(draggedEvent) {
  // 해당 라인의 이벤트만 필터링
  const currentLineCode = draggedEvent.LineCode;
  let eventsForCurrentLine = availableEvents.value.filter(e => e.LineCode === currentLineCode);

  // 드래그된 이벤트의 정보를 복사본에서 찾아서 업데이트합니다.
  const draggedIndex = eventsForCurrentLine.findIndex(e => e.Id === draggedEvent.Id);
  if (draggedIndex > -1) {
    eventsForCurrentLine[draggedIndex].StartTime = draggedEvent.StartTime;
    eventsForCurrentLine[draggedIndex].EndTime = draggedEvent.EndTime;
  }

  // 이벤트들을 시작 시간 순서로 정렬
  eventsForCurrentLine.sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime());

  const changedEvents = [draggedEvent]; // 변경된 이벤트 목록 초기화

  // 이벤트 배열을 순회하며 충돌 검사 및 밀어내기
  for (let i = 0; i < eventsForCurrentLine.length - 1; i++) {
    const currentEvent = eventsForCurrentLine[i];
    const nextEvent = eventsForCurrentLine[i + 1];

    // 충돌 조건: 현재 이벤트가 다음 이벤트의 시작 시간 이후에 끝나는 경우
    if (currentEvent.EndTime.getTime() > nextEvent.StartTime.getTime()) {
      // 이벤트 길이 계산
      const pushDuration = nextEvent.EndTime.getTime() - nextEvent.StartTime.getTime();

      // 새로운 시작 및 끝 시간 계산
      const newStartTime = currentEvent.EndTime;
      const newEndTime = new Date(newStartTime.getTime() + pushDuration);

      // 이벤트 시간 업데이트
      nextEvent.StartTime = newStartTime;
      nextEvent.EndTime = newEndTime;

      // 변경된 이벤트 목록에 추가
      changedEvents.push(nextEvent);
    }
  }

  // 변경된 모든 이벤트 목록 반환
  return changedEvents;
}

function onPopupOpen(args) {
  if (args.type === 'QuickInfo' || args.type === 'Editor') {
    args.cancel = true;
  }
}

function onSelectedDragStart(args) {
  if (args.data.Id !== props.productionPlanDetailId) {
    args.cancel = true;
  }
}

function onDragStart(args) {
  args.cancel = true;
}
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
</style>
