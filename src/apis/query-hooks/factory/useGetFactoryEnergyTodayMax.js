import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getFactoryEnergyTodayMax } from '@/apis/query-functions/factoryEnergyUsage';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetFactoryEnergyTodayMax(factoryCode) {
  const authStore = useAuthStore();
  const resolvedCode = computed(() => unref(factoryCode));

  return useQuery({
    queryKey: ['factoryEnergyTodayMax', resolvedCode],
    queryFn: () => getFactoryEnergyTodayMax(resolvedCode.value),
    enabled: computed(() => authStore.isLoggedIn && Boolean(resolvedCode.value)),
  });
}
