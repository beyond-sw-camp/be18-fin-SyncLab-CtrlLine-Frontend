<template>
  <div class="relative">
    <div>
      <Badge variant="secondary" class="mb-4">선택 라인</Badge>
      <p class="text-gray-500 text-xs pl-1 pb-2">드래그하여 일정을 수정할 수 있습니다.</p>
      <div class="pl-1 pb-2 flex flex-wrap gap-2 text-[11px]">
        <div
          class="flex justify-center px-1 py-0.5 rounded-full border text-gray-700 text-[9px]"
          :style="{
            backgroundColor: DETAIL_HIGHLIGHT.background,
            border: DETAIL_HIGHLIGHT.border,
            color: DETAIL_HIGHLIGHT.color,
          }"
        >
          수정 가능
        </div>

        <div
          class="px-1 py-0.5 rounded-full border text-[9px]"
          style="background: #fef3c7; color: #b45309; border-color: #fcd34d"
        >
          PENDING
        </div>

        <div
          class="px-1 py-0.5 rounded-full border text-[9px]"
          style="background: #dbeafe; color: #1d4ed8; border-color: #93c5fd"
        >
          CONFIRMED
        </div>

        <div
          class="px-1 py-0.5 rounded-full border text-[9px]"
          style="background: #f3e8ff; color: #6d28d9; border-color: #d8b4fe"
        >
          RUNNING
        </div>

        <div
          class="px-1 py-0.5 rounded-full border text-[9px]"
          style="background: #d1fae5; color: #047857; border-color: #6ee7b7"
        >
          COMPLETED
        </div>
      </div>
      <ejs-schedule
        class="time-scale hide-scrollbar"
        :timeScale="optimizedTimeScaleOptions"
        v-if="lineCode && selectedLineResource.length > 0"
        ref="selectedScheduleRef"
        :selectedDate="selectedDateSelected"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek', 'TimelineMonth']"
        :current-view="'TimelineDay'"
        :eventSettings="selectedEventSettings"
        :showCurrentTimeIndicator="true"
        :popupOpen="onPopupOpen"
        :dragStart="onSelectedDragStart"
        :dragStop="onSelectedDragStop"
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
      <p class="text-gray-500 text-xs pl-1 pb-2">
        조회 전용 일정입니다. 드래그하여 이동할 수 없습니다.
      </p>
      <ejs-schedule
        v-if="availableLineResource.length > 0"
        ref="availableScheduleRef"
        :selectedDate="selectedDateAvailable"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek', 'TimelineMonth']"
        :current-view="'TimelineDay'"
        :eventSettings="availableEventSettings"
        :popupOpen="onPopupOpen"
        :dragStop="onAvailableDragStop"
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
import { toast } from 'vue-sonner';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { Badge } from '@/components/ui/badge';
import { DETAIL_HIGHLIGHT, STATUS_COLORS } from '@/constants/productionPlanStatus';
import { useScheduleRangeManager } from '@/hooks/useScheduleRangeManager';
import ScheduleTooltip from '@/pages/production-management/production-plan/ScheduleTooltip.vue';
import { useUserStore } from '@/stores/useUserStore';

provide('schedule', [TimelineViews, Day, Week, TimelineMonth, DragAndDrop]);

const props = defineProps({
  productionPlanDetail: Object,
  factoryId: Number,
  factoryCode: String,
  lineCode: String,
  draftStartTime: String,
  draftEndTime: String,
  draftItem: Object,
  draftQty: Number,
});

const userStore = useUserStore();
const lineCode = computed(() => props.lineCode);

const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null,
});

const optimizedTimeScaleOptions = {
  enable: true,
  interval: 15,
  slotCount: 15,
};

function onEventClick(args) {
  const el = args.element;
  const rect = el.getBoundingClientRect();
  const width = 256;
  const gap = 10;

  const wrap = document.querySelector('.e-schedule .e-content-wrap');
  const scrollTop = wrap ? wrap.scrollTop : 0;
  const scheduleTop = wrap ? wrap.getBoundingClientRect().top : 0;

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
  ) {
    return null;
  }

  const isLineChanged = props.lineCode !== props.productionPlanDetail.lineCode;
  if (!isLineChanged) return null;

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
});

function onEventRendered(args) {
  const ev = args.data;

  if (ev.Id === 'draft-modified') {
    args.element.style.setProperty('background-color', 'var(--primary)', 'important');
    args.element.style.setProperty('border-color', 'var(--primary)', 'important');
    args.element.style.setProperty('color', 'white', 'important');
    return;
  }

  if (props.productionPlanDetail.id && ev.Id === props.productionPlanDetail.id) {
    args.element.style.setProperty('background-color', DETAIL_HIGHLIGHT.background, 'important');
    args.element.style.setProperty('border-color', DETAIL_HIGHLIGHT.border, 'important');
    args.element.style.setProperty('color', DETAIL_HIGHLIGHT.text, 'important');
    return;
  }

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

function makeEvent(ev) {
  return {
    Id: ev.id,
    Subject: ev.documentNo,
    StartTime: new Date(ev.startTime),
    EndTime: new Date(ev.actualEndTime ?? ev.endTime),
    Status: ev.status,
    LineCode: ev.lineCode,
    ItemName: ev.itemName,
    ItemQty: ev.plannedQty,
  };
}

// 선택 재정렬
const selectedEvents = ref([]);

// 서버 데이터 + draft 변동 시 초기화
watch(
  [selectedLineData, draftEvent],
  ([data, draft]) => {
    const base = data?.map(makeEvent) ?? [];
    let result = base;

    if (draft) {
      // 상세조회 중인 이벤트는 빼고 draft로 교체
      result = [...base.filter(ev => ev.Id !== props.productionPlanDetail.id), draft];
    }

    result.sort((a, b) => a.StartTime - b.StartTime);
    selectedEvents.value = result;
  },
  { immediate: true },
);

// 선택 가능한 라인은 읽기 전용
const availableEvents = computed(() => {
  const serverEvents = availableLineData.value?.map(makeEvent) ?? [];

  // 선택된 라인의 변경된 결과
  const changedEvents = selectedEvents.value;

  // 서버 이벤트 중 선택라인의 원래 이벤트 제거
  const filteredServer = serverEvents.filter(ev => !changedEvents.some(c => c.Id === ev.Id));

  // 서버 + 변경된 selectedEvents 병합
  const merged = [...filteredServer, ...changedEvents];

  // 시간 순 정렬
  merged.sort((a, b) => a.StartTime - b.StartTime);

  return merged;
});

// eventSettings
const selectedEventSettings = computed(() => ({
  dataSource: [...selectedEvents.value],
  resources: ['Lines'],
}));

const availableEventSettings = computed(() => ({
  dataSource: [...availableEvents.value],
  resources: ['Lines'],
}));

const beforeDragEvents = ref([]); // drag 시작 직전의 selectedEvents 스냅샷
const beforeDragMoved = ref(null); // 어떤 이벤트를 움직였는지 저장
const DRAG_ORDER_EPSILON_MS = 1000; // 드래그 순서 보정용 (1초)

function onSelectedDragStart(args) {
  const ev = args.data;

  // 드래그 시작 시 전체 스냅샷 저장
  beforeDragEvents.value = selectedEvents.value.map(e => ({
    ...e,
    StartTime: new Date(e.StartTime),
    EndTime: new Date(e.EndTime),
  }));

  // 현재 드래그 중인 이벤트의 "원래" 시작 시각 저장
  beforeDragMoved.value = {
    id: ev.Id,
    start: new Date(ev.StartTime),
  };
}

function compactFuture(originalOrder, orderedFuture, now, role) {
  if (!orderedFuture.length) return [];

  const durationMap = new Map(
    originalOrder.map(ev => [ev.Id, ev.EndTime.getTime() - ev.StartTime.getTime()]),
  );

  // 시작 기준은 "드래그 전 future 중 가장 이른 시작시간" 또는 now 중 더 큰 값
  let baseStart = originalOrder[0].StartTime;
  if (baseStart < now) baseStart = new Date(now);

  let cursor = new Date(baseStart);
  const result = [];

  for (const ev of orderedFuture) {
    if (role === 'MANAGER' && ev.Status === 'CONFIRMED') {
      // MANAGER: CONFIRMED 는 시간 고정
      const orig = originalOrder.find(o => o.Id === ev.Id) || ev;
      const fixed = {
        ...ev,
        StartTime: new Date(orig.StartTime),
        EndTime: new Date(orig.EndTime),
      };
      result.push(fixed);

      if (fixed.EndTime > cursor) {
        cursor = new Date(fixed.EndTime);
      }
      continue;
    }

    const len = durationMap.get(ev.Id) ?? ev.EndTime.getTime() - ev.StartTime.getTime();
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + len);

    result.push({
      ...ev,
      StartTime: start,
      EndTime: end,
    });

    cursor = end;
  }

  return result;
}

function onSelectedDragStop(args) {
  const moved = args.data;
  if (!moved) return;

  const role = userStore.userRole;
  const now = new Date();

  // 과거로 드롭되면 취소 (UI 롤백)
  if (new Date(moved.StartTime) < now) {
    args.cancel = true;
    return;
  }

  const baseEvents = beforeDragEvents.value.length ? beforeDragEvents.value : selectedEvents.value;

  const original = baseEvents.map(ev => ({
    ...ev,
    StartTime: new Date(ev.StartTime),
    EndTime: new Date(ev.EndTime),
  }));

  const originalMoved = baseEvents.find(ev => ev.Id === moved.Id);
  const movedStart = new Date(moved.StartTime);
  let dropTime = new Date(movedStart);

  if (originalMoved) {
    const originalStart = new Date(originalMoved.StartTime);

    if (movedStart > originalStart) {
      // 뒤로 이동
      dropTime = new Date(dropTime.getTime() + DRAG_ORDER_EPSILON_MS);
    } else if (movedStart < originalStart) {
      // 앞으로 이동
      dropTime = new Date(dropTime.getTime() - DRAG_ORDER_EPSILON_MS);
    }
  }

  // past / future 분리
  const past = original.filter(ev => ev.StartTime < now);
  let future = original.filter(ev => ev.StartTime >= now);
  if (!future.length) return;

  future.sort((a, b) => a.StartTime - b.StartTime);

  const movedIdx = future.findIndex(ev => ev.Id === moved.Id);
  if (movedIdx === -1) {
    selectedEvents.value = original;
    beforeDragEvents.value = [];
    beforeDragMoved.value = null;
    return;
  }
  const [movedOriginal] = future.splice(movedIdx, 1);

  // dropTime 기준으로 새 위치 결정
  let insertIndex = future.findIndex(ev => dropTime < ev.StartTime);
  if (insertIndex === -1) insertIndex = future.length;

  const orderedFuture = [
    ...future.slice(0, insertIndex),
    movedOriginal,
    ...future.slice(insertIndex),
  ];

  // compaction
  const compactedFuture = compactFuture(
    future.concat(movedOriginal).sort((a, b) => a.StartTime - b.StartTime),
    orderedFuture,
    now,
    role,
  );

  let merged = [...past, ...compactedFuture].sort((a, b) => a.StartTime - b.StartTime);

  if (role === 'MANAGER') {
    const idx = merged.findIndex(ev => ev.Id === moved.Id);
    if (idx !== -1) {
      const current = merged[idx];
      const prev = merged[idx - 1];
      const next = merged[idx + 1];

      const overlapsPrevConfirmed =
        prev && prev.Status === 'CONFIRMED' && current.StartTime < prev.EndTime; // 앞 CONFIRMED 과 겹침

      const overlapsNextConfirmed =
        next && next.Status === 'CONFIRMED' && current.EndTime > next.StartTime; // 뒤 CONFIRMED 과 겹침

      if (overlapsPrevConfirmed || overlapsNextConfirmed) {
        // 롤백
        selectedEvents.value = baseEvents.map(ev => ({
          ...ev,
          StartTime: new Date(ev.StartTime),
          EndTime: new Date(ev.EndTime),
        }));
        beforeDragEvents.value = [];
        beforeDragMoved.value = null;
        args.cancel = true;

        toast.info('담당자는 CONFIRMED 상태의 일정을 수정할 수 없습니다. ');
        return;
      }
    }
  }

  const finalMoved = merged.find(ev => ev.Id === moved.Id);
  const beforeInfo = beforeDragMoved.value;

  if (finalMoved && beforeInfo && beforeInfo.id === moved.Id) {
    const originalStart = beforeInfo.start;
    const finalStart = new Date(finalMoved.StartTime);

    if (finalStart > originalStart) {
      // 뒤로 이동
      finalMoved.StartTime = new Date(finalStart.getTime() + DRAG_ORDER_EPSILON_MS);
      finalMoved.EndTime = new Date(finalMoved.EndTime.getTime() + DRAG_ORDER_EPSILON_MS);
    } else if (finalStart < originalStart) {
      // 앞으로 이동
      finalMoved.StartTime = new Date(finalStart.getTime() - DRAG_ORDER_EPSILON_MS);
      finalMoved.EndTime = new Date(finalMoved.EndTime.getTime() - DRAG_ORDER_EPSILON_MS);
    }

    merged = merged.map(ev => (ev.Id === finalMoved.Id ? { ...finalMoved } : ev));
  }

  selectedEvents.value = merged;
  beforeDragEvents.value = [];
  beforeDragMoved.value = null;

  const movedAfterAdjust = merged.find(ev => ev.Id === moved.Id);
  if (movedAfterAdjust) {
    emit('updateStartEndTime', {
      StartTime: movedAfterAdjust.StartTime,
      EndTime: movedAfterAdjust.EndTime,
    });
  }
}

const selectedScheduleRef = ref(null);
const availableScheduleRef = ref(null);

// 하단 스케줄에서 드래그는 아직 사용 안 함 → 전부 취소
function onAvailableDragStop(args) {
  args.cancel = true;
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

/* 스크롤바 얇게 */
.e-schedule .e-content-wrap::-webkit-scrollbar,
.e-schedule::-webkit-scrollbar {
  width: 2px;
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

/* 막대바 높이 */
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
