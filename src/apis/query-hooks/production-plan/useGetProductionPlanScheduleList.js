import { useInfiniteQuery } from '@tanstack/vue-query';
import { computed, reactive } from 'vue';

import { getProductionPlanScheduleList } from '@/apis/query-functions/productionPlan';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPlanScheduleList(initialFilters = {}) {
  const authStore = useAuthStore();

  const filters = reactive({
    factoryCode: initialFilters.factoryCode ?? '',
    lineCode: initialFilters.lineCode ?? '',
    startTime: initialFilters.startTime ?? null,
    endTime: initialFilters.endTime ?? null,
  });

  const queryParams = computed(() => {
    const cleaned = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    return cleaned;
  });

  const { data, fetchNextPage, hasNextPage, fetchPreviousPage, hasPreviousPage } = useInfiniteQuery(
    {
      queryKey: ['productionPlanScheduleList', queryParams],
      queryFn: ({ pageParam }) =>
        getProductionPlanScheduleList({
          ...queryParams.value,
          startTime: pageParam.startTime ?? queryParams.value.startTime,
          endTime: pageParam.endTime ?? queryParams.value.endTime,
        }),
      enabled: computed(
        () => authStore.isLoggedIn && !!queryParams.value.startTime && !!queryParams.value.endTime,
      ),
      initialPageParam: {
        startTime: queryParams.value.startTime,
        endTime: queryParams.value.endTime,
      },
      getPreviousPageParam: firstPage => {
        if (!firstPage?.data || firstPage.data.length === 0) return undefined;

        const firstEvent = firstPage.data[0];
        const prevEnd = firstEvent.startTime;
        const prevStart = new Date(
          new Date(firstEvent.startTime).getTime() - 6 * 60 * 60 * 1000,
        ).toISOString(); // 6시간 단위

        return {
          startTime: prevStart,
          endTime: prevEnd,
        };
      },
      getNextPageParam: lastPage => {
        if (!lastPage?.data || lastPage.data.length === 0) return undefined;

        const lastEvent = lastPage.data[lastPage.data.length - 1];

        const nextStart = lastEvent.endTime; // 이전 endTime = 다음 startTime
        const nextEnd = new Date(
          new Date(lastEvent.endTime).getTime() + 6 * 60 * 60 * 1000,
        ).toISOString(); // 6시간 단위

        return {
          startTime: nextStart,
          endTime: nextEnd,
        };
      },
    },
  );

  return {
    data,
    fetchNextPage,
    hasNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    filters,
  };
}
