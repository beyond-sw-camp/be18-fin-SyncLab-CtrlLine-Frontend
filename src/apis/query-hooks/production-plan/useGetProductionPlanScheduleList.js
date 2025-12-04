import { useQuery } from '@tanstack/vue-query';
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

  const { data } = useQuery({
    queryKey: ['productionPlanScheduleList', queryParams],
    queryFn: () => getProductionPlanScheduleList(queryParams.value),
    enabled: computed(
      () => authStore.isLoggedIn && !!queryParams.value.startTime && !!queryParams.value.endTime,
    ),
  });

  return {
    data,
    filters,
  };
}
