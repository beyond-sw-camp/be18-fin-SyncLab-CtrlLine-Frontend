import { useInfiniteQuery } from '@tanstack/vue-query';
import { computed, reactive } from 'vue';

import { getProductionPlanScheduleList } from '@/apis/query-functions/productionPlan';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPlanScheduleList(initialFilters = {}) {
  const authStore = useAuthStore();
  // const fixedSort = ['documentNo,desc'];

  const filters = reactive({
    factoryCode: initialFilters.factoryCode ?? '',
    lineCode: initialFilters.lineCode ?? '',
    // startTime: initialFilters.startTime ?? null,
    // endTime: initialFilters.endTime ?? null,
  });

  const queryParams = computed(() => {
    const cleaned = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    // cleaned.sort = fixedSort;

    return cleaned;
  });

  return useInfiniteQuery({
    queryKey: ['productionPlanScheduleList', queryParams],
    queryFn: ({ pageParam }) =>
      getProductionPlanScheduleList({
        ...queryParams.value,
        startTime: pageParam.startTime,
        endTime: pageParam.endTime,
      }),
    enabled: computed(() => authStore.isLoggedIn),
    initialPageParam: {
      startTime: initialFilters.startTime,
      endTime: initialFilters.endTime,
    },
    getNextPageParam: lastPage => {
      if (!lastPage?.data || lastPage.data.length === 0) return undefined;

      const lastEvent = lastPage.data[lastPage.data.length - 1];

      const nextStart = lastEvent.endTime; // 이전 endTime = 다음 startTime
      const nextEnd = new Date(
        new Date(lastEvent.endTime).getTime() + 6 * 60 * 60 * 1000,
      ).toISOString();
      // ↑ 일단 6시간씩 로딩 (원하면 1일 단위로 바꿈 가능)

      return {
        startTime: nextStart,
        endTime: nextEnd,
      };
    },
  });
}
