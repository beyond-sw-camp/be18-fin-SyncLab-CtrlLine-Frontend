import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive } from 'vue';

import { getProductionPlanBoundary } from '@/apis/query-functions/productionPlan';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPlanBoundary(initialFilters = {}) {
  const authStore = useAuthStore();

  const filters = reactive({
    factoryCode: initialFilters.factoryCode ?? null,
    lineCode: initialFilters.lineCode ?? null,
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

  const { data, refetch } = useQuery({
    queryKey: ['productionPlanBoundary', queryParams],
    queryFn: () => getProductionPlanBoundary(queryParams.value),
    enabled: computed(() => authStore.isLoggedIn),
    placeholderData: keepPreviousData,
  });

  

  return {
    data,
    refetch,
    filters,
  };
}
