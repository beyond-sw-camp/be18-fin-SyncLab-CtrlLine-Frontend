import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getProductionPerformanceMonthlyDefectiveRate } from '@/apis/query-functions/productionPerformance';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetMonthlyDefectRate(factoryCodeRef, baseMonthRef = null) {
  const authStore = useAuthStore();

  const resolvedFactoryCode = computed(() => unref(factoryCodeRef));
  const resolvedBaseMonth = computed(() => unref(baseMonthRef) || null);

  return useQuery({
    queryKey: ['monthlyDefectRate', resolvedFactoryCode, resolvedBaseMonth],
    queryFn: () =>
      getProductionPerformanceMonthlyDefectiveRate(
        resolvedFactoryCode.value,
        resolvedBaseMonth.value,
      ),
    enabled: computed(() => authStore.isLoggedIn && Boolean(resolvedFactoryCode.value)),
  });
}
