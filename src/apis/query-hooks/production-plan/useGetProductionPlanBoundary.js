import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getProductionPlanBoundary } from '@/apis/query-functions/productionPlan';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPlanBoundary({ factoryCode, lineCode }) {
  const authStore = useAuthStore();

  const queryKey = computed(() => ['productionPlanBoundary', factoryCode.value, lineCode.value]);

  const { data, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      getProductionPlanBoundary({
        factoryCode: factoryCode.value,
        lineCode: lineCode.value,
      }),
    enabled: computed(() => authStore.isLoggedIn && !!factoryCode.value && !!lineCode.value),
    placeholderData: keepPreviousData,
  });

  return {
    data,
    refetch,
  };
}
