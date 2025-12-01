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
        :views="['TimelineDay', 'TimelineWeek']"
        :current-view="'TimelineDay'"
        :eventSettings="selectedEventSettings"
        :group="groupOptions"
        :resources="selectedLineResource"
      />
    </div>

    <div>
      <Badge variant="secondary" class="mb-4 mt-6">선택 가능한 라인</Badge>
      <ejs-schedule
        ref="availableScheduleRef"
        :selectedDate="selectedDate"
        height="650px"
        width="100%"
        :views="['TimelineDay', 'TimelineWeek']"
        :current-view="'TimelineDay'"
        :eventSettings="availableEventSettings"
        :group="groupOptions"
        :resources="availableLineResource"
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
} from '@syncfusion/ej2-vue-schedule';
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useGetProductionPlanScheduleList from '@/apis/query-hooks/production-plan/useGetProductionPlanScheduleList';
import { Badge } from '@/components/ui/badge';

provide('schedule', [TimelineViews, Day, Week]);

const props = defineProps({
  factoryId: Number,
  factoryCode: String,
  lineCode: String,
});

const startTime = '2025-11-21T00:00:00';
const endTime = '2025-11-22T00:00:00';
const selectedDate = new Date(startTime.split('T')[0]);

// 공장별 라인 조회
const { data: lineList, filters } = useGetLineList({
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
} = useGetProductionPlanScheduleList({
  factoryCode: props.factoryCode,
  lineCode: null,
  startTime,
  endTime,
});

const {
  data: selectedLineData,
  fetchNextPage: fetchSelectedNext,
  hasNextPage: hasSelectedNext,
} = useGetProductionPlanScheduleList({
  factoryCode: props.factoryCode,
  lineCode: props.lineCode,
  startTime,
  endTime,
});

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

const attachScrollInfinite = (refInstance, fetchFn, hasNext) => {
  nextTick(() => {
    const wrap = refInstance.value?.ej2Instances?.element?.querySelector('.e-content-wrap');
    if (!wrap) return;

    const handler = () => {
      const nearEnd = wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 300;
      if (nearEnd && hasNext.value) fetchFn();
    };
    wrap.addEventListener('scroll', handler);
  });
};

onMounted(() => {
  attachScrollInfinite(availableScheduleRef, fetchAvailableNext, hasAvailableNext);
  attachScrollInfinite(selectedScheduleRef, fetchSelectedNext, hasSelectedNext);
});

watch(
  () => props.factoryId,
  newVal => {
    filters.factoryId = newVal;
  },
);
</script>

<style lang="scss" scoped></style>
