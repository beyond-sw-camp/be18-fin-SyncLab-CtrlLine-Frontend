import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getProductionPlan } from '@/apis/query-functions/productionPlan';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPlan(productionPlanId) {
  const authStore = useAuthStore();
  return useQuery({
    queryKey: ['productionPlan', productionPlanId],
    queryFn: () => getProductionPlan(productionPlanId),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
