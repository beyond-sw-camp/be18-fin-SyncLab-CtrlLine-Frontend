import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getProductionPerformance } from '@/apis/query-functions/productionPerformance';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPerformance(id) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['productionPerformance', id],
    queryFn: () => getProductionPerformance(id),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
