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
        :editSettings="editSettings"
        :showCurrentTimeIndicator="true"
        :popupOpen="onPopupOpen"
        :group="groupOptions"
        :resources="selectedLineResource"
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
        :editSettings="editSettings"
        :showCurrentTimeIndicator="true"
        :popupOpen="onPopupOpen"
        :group="groupOptions"
        :resources="availableLineResource"
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
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/constants/productionPlanStatus';
import { useScheduleRangeManager } from '@/hooks/useScheduleRangeManager';
import ScheduleTooltip from '@/pages/production-management/production-plan/ScheduleTooltip.vue';

const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null,
});

// 이벤트 클릭 핸들러
function onEventClick(args) {
  const el = args.element;
  const rect = el.getBoundingClientRect();

  const width = 256;
  const gap = 10;

  // 실제 스크롤되는 곳
  const scheduleWrap = document.querySelector('.e-schedule .e-content-wrap');
  const scrollTop = scheduleWrap.scrollTop;

  // 스케줄 전체의 문서 기반 top 위치
  const scheduleRect = scheduleWrap.getBoundingClientRect();
  const scheduleTop = scheduleRect.top;

  let x = rect.right - width;

  // 700 이하게 될 때까지 반복
  while (x > 700) {
    x = x / 1.5;
  }

  // y: 막대바 bottom + 스케줄 내부 스크롤 보정
  const y = rect.bottom - scheduleTop + scrollTop - gap * 2;

  tooltip.value = {
    show: true,
    x,
    y,
    data: args.event,
  };
}

function onEventRendered(args) {
  console.log(args);
  const status = args.data?.Status;
  const colorSet = STATUS_COLORS[status];

  console.log(status);

  if (!colorSet) return;

  args.element.style.backgroundColor = colorSet.background;
  args.element.style.borderColor = colorSet.border;

  const subject = args.element.querySelector('.e-subject');
  if (subject) {
    subject.style.color = colorSet.text;
  }
}

provide('schedule', [TimelineViews, Day, Week, TimelineMonth]);

const editSettings = {
  allowAdding: false,
  allowEditing: false,
  allowDeleting: false,
  showDeleteConfirmDialog: false,
  showQuickInfo: false,
};

function onPopupOpen(args) {
  if (args.type === 'QuickInfo') {
    args.cancel = true; // 기본 퀵인포도 막음
  }

  if (args.type === 'Editor') {
    // 이벤트 추가하는 에디터 막음
    args.cancel = true;
    return;
  }
}

const props = defineProps({
  factoryId: Number,
  factoryCode: String,
  lineCode: String,
});

// 공장별 라인 조회
const { data: lineListSchedule, filters: lineFilters } = useGetLineList({
  factoryId: props.factoryId,
});

// 선택한 라인
const selectedLine = computed(() => {
  if (!props.lineCode || !lineListSchedule.value?.content) return null;
  return lineListSchedule.value.content.find(l => l.lineCode === props.lineCode);
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

const {
  data: availableLineData,
  fetchNextPage: fetchAvailableNext,
  hasNextPage: hasAvailableNext,
  fetchPreviousPage: fetchAvailablePrev,
  hasPreviousPage: hasAvailablePrev,
  filters: availableFilters,
} = useGetProductionPlanScheduleList({
  factoryCode: props.factoryCode,
  lineCode: null,
});

const {
  data: selectedLineData,
  fetchNextPage: fetchSelectedNext,
  hasNextPage: hasSelectedNext,
  fetchPreviousPage: fetchSelectedPrev,
  hasPreviousPage: hasSelectedPrev,
  filters: selectedFilters,
} = useGetProductionPlanScheduleList({
  factoryCode: props.factoryCode,
  lineCode: props.lineCode,
});

const { selectedDate: selectedDateSelected, onNavigation: onSelectedNavigation } =
  useScheduleRangeManager(selectedFilters);

const { selectedDate: selectedDateAvailable, onNavigation: onAvailableNavigation } =
  useScheduleRangeManager(availableFilters);

function onSelectedScheduleAction(args) {
  if (!['dateNavigate', 'viewNavigate'].includes(args.requestType)) return;

  const inst = selectedScheduleRef.value?.ej2Instances;

  if (inst) onSelectedNavigation(inst);
}

function onAvailableScheduleAction(args) {
  if (!['dateNavigate', 'viewNavigate'].includes(args.requestType)) return;

  const inst = availableScheduleRef.value?.ej2Instances;

  if (inst) onAvailableNavigation(inst);
}

const makeEvent = ev => {
  return {
    Id: ev.id,
    Subject: ev.documentNo,
    StartTime: new Date(ev.startTime),
    EndTime: new Date(ev.endTime),
    LineCode: ev.lineCode,
    LineName: ev.lineName,
    FactoryCode: ev.factoryCode,
    FactoryName: ev.factoryName,
    ItemName: ev.itemName,
    ItemQty: ev.plannedQty,
    Status: ev.status,
  };
};

const availableEvents = computed(
  () => availableLineData.value?.pages?.flatMap(p => p).map(makeEvent) ?? [],
);

const selectedEvents = computed(
  () => selectedLineData.value?.pages?.flatMap(p => p).map(makeEvent) ?? [],
);

const availableEventSettings = computed(() => ({
  dataSource: availableEvents.value,
  resources: ['Lines'],
}));

const selectedEventSettings = computed(() => ({
  dataSource: selectedEvents.value,
  resources: ['Lines'],
}));

const availableScheduleRef = ref(null);
const selectedScheduleRef = ref(null);

// 양합향 무한 스크롤
const attachScrollInfinite = (refInstance, fetchNext, hasNext, fetchPrev, hasPrev) => {
  nextTick(() => {
    const wrap = refInstance.value?.ej2Instances?.element?.querySelector('.e-content-wrap');
    if (!wrap) return;

    const handler = () => {
      // 우측 끝 (미래 데이터)
      const nearRightEnd = wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 300;
      if (nearRightEnd && hasNext.value) {
        fetchNext();
      }

      // 좌측 끝 (과거 데이터)
      const nearLeftEnd = wrap.scrollLeft <= 300;
      if (nearLeftEnd && hasPrev.value) {
        fetchPrev();
      }
    };

    wrap.addEventListener('scroll', handler);
  });
};

onMounted(() => {
  attachScrollInfinite(
    availableScheduleRef,
    fetchAvailableNext,
    hasAvailableNext,
    fetchAvailablePrev,
    hasAvailablePrev,
  );
  attachScrollInfinite(
    selectedScheduleRef,
    fetchSelectedNext,
    hasSelectedNext,
    fetchSelectedPrev,
    hasSelectedPrev,
  );
});

watch(
  () => props.factoryId,
  newVal => {
    lineFilters.factoryId = newVal;
  },
);

watch(
  () => props.factoryCode,
  v => {
    availableFilters.factoryCode = v;
    selectedFilters.factoryCode = v;
  },
);
watch(
  () => props.lineCode,
  v => {
    selectedFilters.lineCode = v;
  },
);
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
