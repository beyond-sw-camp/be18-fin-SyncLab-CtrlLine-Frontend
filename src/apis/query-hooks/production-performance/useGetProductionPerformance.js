import { useQuery } from '@tanstack/vue-query';

import { getProductionPerformance } from '@/apis/query-functions/productionPerformance';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPerformance(productionPerformanceId) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['productionPerformanceDetail', productionPerformanceId],
    queryFn: () => getProductionPerformance(productionPerformanceId),
    enabled: () => authStore.isLoggedIn && !!productionPerformanceId,
  });
}
