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
        :group="groupOptions"
        :resources="selectedLineResource"
        :created="onSelectedCreated"
        :eventRendered="onEventRendered"
        @actionComplete="onSelectedScheduleAction"
        :eventClick="onEventClick"
        :dragAndDrop="true"
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

import ScheduleTooltip from './ScheduleTooltip.vue';

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
  factoryId: props.factoryId,
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

function onSelectedScheduleAction(args) {
  // 날짜 이동 처리
  if (['dateNavigate', 'viewNavigate'].includes(args.requestType)) {
    const inst = selectedScheduleRef.value?.ej2Instances;
    if (inst) onSelectedNavigation(inst);
  }

  // 드래그앤드롭 후 시간 변경 처리
  if (args.requestType === 'eventChanged') {
    const updatedEvents = args.changedRecords; // 여러개 이벤트를 처리하기 위해 배열 처리

    updatedEvents.forEach(updated => {
      // 선택된 라인에서 업데이트된 이벤트와 동일한 lineCode를 가진 이벤트들을 찾음
      if (updated && props.mode === 'detail' && updated.Id === props.productionPlanDetailId) {
        // 선택된 라인에 있는 이벤트 업데이트
        emit('updateStartEndTime', updated);

        // 선택 가능한 라인에 동일한 라인 코드가 있는 경우, 해당 이벤트도 업데이트
        availableLineResource.value[0].dataSource.forEach(line => {
          if (line.LineCode === updated.LineCode) {
            // 동일한 라인 코드가 존재하면 해당 라인도 업데이트
            availableEvents.value.forEach(event => {
              if (event.LineCode === updated.LineCode) {
                event.StartTime = updated.StartTime;
                event.EndTime = updated.EndTime;
              }
            });
          }
        });
      }
    });

    nextTick(() => {
      selectedScheduleRef.value?.ej2Instances?.refreshEvents();
      availableScheduleRef.value?.ej2Instances?.refreshEvents();
    });
  }
}

function onAvailableScheduleAction(args) {
  if (!['dateNavigate', 'viewNavigate'].includes(args.requestType)) return;
  const inst = availableScheduleRef.value?.ej2Instances;
  if (inst) onAvailableNavigation(inst);
}

function onPopupOpen(args) {
  if (args.type === 'QuickInfo' || args.type === 'Editor') {
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
/* inline style 강제로 덮어쓰기 */
.e-schedule .e-timeline-view .e-content-wrap tr,
.e-schedule .e-timeline-view .e-resource-column-wrap tr {
  height: 30px !important;
}

/* 막대바 높이 지정 */
.e-appointment {
  height: 22px !important;
  border-radius: 12px !important;
}

/* 전체 컨테이너 높이도 자동으로 늘어나게  */
.e-schedule .e-timeline-view .e-content-wrap,
.e-schedule .e-timeline-view .e-resource-column-wrap {
  height: auto !important;
}
</style>
