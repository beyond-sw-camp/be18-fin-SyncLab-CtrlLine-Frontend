<template>
  <div class="relative">
    <div>
      <Badge variant="secondary" class="mb-4">선택 라인</Badge>
      <ejs-schedule
        class="time-scale hide-scrollbar"
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
        :dragStart="onSelectedDragStart"
        :dragStop="onDragStop"
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
  DragAndDrop,
} from '@syncfusion/ej2-vue-schedule';
import { computed, provide, ref, watch } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { Badge } from '@/components/ui/badge';
import { DETAIL_HIGHLIGHT, STATUS_COLORS } from '@/constants/productionPlanStatus';
import { useScheduleRangeManager } from '@/hooks/useScheduleRangeManager';
import ScheduleTooltip from '@/pages/production-management/production-plan/ScheduleTooltip.vue';
import { useUserStore } from '@/stores/useUserStore';

provide('schedule', [TimelineViews, Day, Week, TimelineMonth, DragAndDrop]);

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
  productionPlanDetail: Object,
  mode: { type: String, default: 'detail' },
  draftStartTime: String,
  draftEndTime: String,
  draftItem: Object,
  draftQty: Number,
  isEmergent: Boolean,
  productionManagerNo: String,
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
  const scrollTop = wrap?.scrollTop ?? 0;
  const scheduleTop = wrap?.getBoundingClientRect().top ?? 0;

  let x = rect.right - width;
  while (x > 700) x = x / 1.5;

  const y = rect.bottom - scheduleTop + scrollTop - gap * 2;

  tooltip.value = { show: true, x, y, data: args.event };
}

// ---- draft 이벤트 (라인 변경/생성 시) ----
const draftEvent = computed(() => {
  if (
    !props.lineCode ||
    !props.draftStartTime ||
    !props.draftEndTime ||
    !props.draftItem ||
    !props.draftQty
  )
    return null;

  if (props.mode === 'create') {
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
  }

  const isLineChanged = props.lineCode !== props.productionPlanDetail.lineCode;

  if (props.mode === 'detail' && isLineChanged) {
    return {
      Id: 'draft-modified',
      Subject: props.productionPlanDetail.planDocumentNo,
      StartTime: new Date(props.draftStartTime),
      EndTime: new Date(props.draftEndTime),
      LineCode: props.lineCode,
      ItemName: props.draftItem.itemName,
      ItemQty: props.draftQty,
      Status: props.productionPlanDetail.status,
    };
  }
  return null;
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

  // 상세조회 중인 이벤트 강조
  if (props.productionPlanDetail.id && ev.Id === props.productionPlanDetail.id) {
    args.element.style.setProperty('background-color', DETAIL_HIGHLIGHT.background, 'important');
    args.element.style.setProperty('border-color', DETAIL_HIGHLIGHT.border, 'important');
    args.element.style.setProperty('color', DETAIL_HIGHLIGHT.text, 'important');
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

function onSelectedDragStart(args) {
  const ev = args.data;
  const role = userStore.userRole;

  // 상세 조회 중인 이벤트만 드래그 허용
  if (ev.Id !== props.productionPlanDetail.id) {
    args.cancel = true;
    return;
  }

  // ADMIN 규칙
  if (role === 'ADMIN') {
    const allowed = ev.Status === 'PENDING' || ev.Status === 'CONFIRMED';
    if (!allowed) {
      args.cancel = true;
    }
    return;
  }

  // MANAGER 규칙
  if (role === 'MANAGER') {
    const isOwner = props.productionPlanDetail.productionManagerNo === userStore.empNo;
    const allowed = ev.Status === 'PENDING' && isOwner;

    if (!allowed) {
      args.cancel = true;
    }
    return;
  }

  // 나머지 롤은 무조건 불가
  args.cancel = true;
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
const makeEvent = ev => ({
  Id: ev.id,
  Subject: ev.documentNo,
  StartTime: new Date(ev.startTime),
  EndTime: new Date(ev.actualEndTime ?? ev.endTime),
  LineCode: ev.lineCode,
  ItemName: ev.itemName,
  ItemQty: ev.plannedQty,
  Status: ev.status,
});

// ---------- 여기부터가 중요한 부분 ----------

// 스케줄에서 실제로 사용하는 상태(수정 가능)
const selectedEvents = ref([]); // [{Id, StartTime, EndTime, ...}]
const baseStartTime = ref(null); // 라인 전체의 "맨 처음 시작 시각" 유지용

// 서버 데이터 + draft가 바뀔 때마다 selectedEvents 초기화
watch(
  [selectedLineData, draftEvent],
  ([data, draft]) => {
    const base = data?.map(makeEvent) ?? [];

    let result = base;
    if (draft) {
      if (props.mode === 'create') {
        result = [...base, draft];
      } else if (props.mode === 'detail') {
        result = [...base.filter(ev => ev.Id !== props.productionPlanDetail.id), draft];
      }
    }

    // 시작시간 기준 정렬
    result.sort((a, b) => a.StartTime - b.StartTime);

    selectedEvents.value = result;

    // 라인의 "최초 시작 시간"은 최초 한 번만 기억
    if (!baseStartTime.value && result.length > 0) {
      baseStartTime.value = new Date(result[0].StartTime);
    }
  },
  { immediate: true },
);

// ejs-schedule 에 바인딩할 설정
const selectedEventSettings = computed(() => ({
  dataSource: [...selectedEvents.value],
  resources: ['Lines'],
}));

const availableEvents = computed(() => {
  const base = availableLineData.value?.map(makeEvent) ?? [];
  if (props.mode === 'create' && draftEvent.value) base.push(draftEvent.value);
  return base;
});

const availableEventSettings = computed(() => ({
  dataSource: [...availableEvents.value],
  resources: ['Lines'],
}));

// 순서 기준 보조 함수
function compactEventsGlobal(events) {
  if (!events.length) return events;

  // 1) 현재 StartTime 기준으로 정렬 (드래그 후 위치 반영)
  const sorted = [...events].sort((a, b) => a.StartTime - b.StartTime);

  // 2) 전체 라인의 기준 시작 시간
  let current = baseStartTime.value ? new Date(baseStartTime.value) : new Date(sorted[0].StartTime);

  const duration = ev => ev.EndTime - ev.StartTime;

  for (const ev of sorted) {
    const len = duration(ev);
    ev.StartTime = new Date(current);
    ev.EndTime = new Date(current.getTime() + len);
    current = ev.EndTime;
  }

  return sorted;
}

const selectedScheduleRef = ref(null);
const availableScheduleRef = ref(null);

function onDragStop(args) {
  const moved = args.data;
  if (!moved) return;

  const events = selectedEvents.value;
  const idx = events.findIndex(ev => ev.Id === moved.Id);
  if (idx === -1) return;

  const originalDuration = events[idx].EndTime - events[idx].StartTime;

  // drop 위치 반영
  events[idx].StartTime = new Date(moved.StartTime);
  events[idx].EndTime = new Date(moved.StartTime.getTime() + originalDuration);

  const compacted = compactEventsGlobal(events);

  selectedEvents.value = [...compacted];

  const inst = selectedScheduleRef.value?.ej2Instances;
  if (inst) {
    inst.deleteEvent(inst.getEvents());
    inst.addEvent([...compacted]);
  }
}

function onSelectedCreated() {
  const inst = selectedScheduleRef.value?.ej2Instances;
  if (inst) onSelectedNavigation(inst);
}

function onAvailableCreated() {
  const inst = availableScheduleRef.value?.ej2Instances;
  if (inst) onAvailableNavigation(inst);
}

const emit = defineEmits(['updateStartEndTime']);

function onSelectedScheduleAction(args) {
  if (['dateNavigate', 'viewNavigate'].includes(args.requestType)) {
    const inst = selectedScheduleRef.value?.ej2Instances;
    if (inst) onSelectedNavigation(inst);
  }

  if (args.requestType === 'eventChanged') {
    const updated = args.changedRecords?.[0];
    if (!updated) return;

    emit('updateStartEndTime', {
      StartTime: updated.StartTime,
      EndTime: updated.EndTime,
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
  if (args.type === 'QuickInfo' || args.type === 'Editor') args.cancel = true;
}
</script>

<style>
.e-schedule {
  overflow: visible !important;
}

.e-schedule .e-content-wrap,
.e-schedule {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.e-schedule .e-content-wrap::-webkit-scrollbar,
.e-schedule::-webkit-scrollbar {
  display: none;
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
