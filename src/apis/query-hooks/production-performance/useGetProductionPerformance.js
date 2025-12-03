import { useQuery } from '@tanstack/vue-query';

import { getProductionPerformance } from '@/apis/query-functions/productionPerformance';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPerformance(id) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['productionPerformanceDetail', id],
    queryFn: () => getProductionPerformance(id),
    enabled: () => authStore.isLoggedIn && !!id,
  });
}
