<template>
  <div>
    <div>
      <Badge variant="secondary" class="mb-4">선택 라인</Badge>
      <ejs-schedule
        v-if="props.lineCode"
        ref="selectedScheduleRef"
        :selectedDate="selectedDate"
        height="300px"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek', 'TimelineMonth']"
        :current-view="'TimelineDay'"
        :eventSettings="selectedEventSettings"
        :group="groupOptions"
        :resources="selectedLineResource"
        @actionComplete="onActionComplete"
      />
    </div>

    <div>
      <Badge variant="secondary" class="mb-4 mt-6">선택 가능한 라인</Badge>
      <ejs-schedule
        ref="availableScheduleRef"
        :selectedDate="selectedDate"
        height="650px"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek', 'TimelineMonth']"
        :current-view="'TimelineDay'"
        :eventSettings="availableEventSettings"
        :group="groupOptions"
        :resources="availableLineResource"
        @actionComplete="onActionComplete"
      />
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
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { Badge } from '@/components/ui/badge';
import { useScheduleRangeManager } from '@/hooks/useScheduleRangeManager';

provide('schedule', [TimelineViews, Day, Week, TimelineMonth]);

const props = defineProps({
  factoryId: Number,
  factoryCode: String,
  lineCode: String,
});

// 공장별 라인 조회
const { data: lineList, filters: lineFilters } = useGetLineList({
  factoryId: props.factoryId,
});

// 선택한 라인
const selectedLine = computed(() => {
  if (!props.lineCode || !lineList.value?.content) return null;
  return lineList.value.content.find(l => l.lineCode === props.lineCode);
});

const availableLineResource = computed(() => [
  {
    field: 'LineCode',
    title: '라인',
    name: 'Lines',
    idField: 'LineCode',
    textField: 'text',
    dataSource:
      lineList.value?.content?.map(l => ({
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

const { selectedDate, onNavigation } = useScheduleRangeManager(availableFilters, selectedFilters);

function onActionComplete(args) {
  if (!['dateNavigate', 'viewNavigate'].includes(args.requestType)) return;

  const inst = availableScheduleRef.value?.ej2Instances || selectedScheduleRef.value?.ej2Instances;

  if (inst) onNavigation(inst);
}

const makeEvent = ev => ({
  Id: ev.id,
  Subject: ev.documentNo,
  StartTime: new Date(ev.startTime),
  EndTime: new Date(ev.endTime),
  LineCode: ev.lineCode,
  LineName: ev.lineName,
});

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
</script>

<style lang="scss" scoped></style>
