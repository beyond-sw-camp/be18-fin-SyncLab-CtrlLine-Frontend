import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getFactoryEnergyLatest } from '@/apis/query-functions/factoryEnergyUsage';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetFactoryEnergyLatest(factoryCode) {
  const authStore = useAuthStore();
  const resolvedCode = computed(() => unref(factoryCode));

  return useQuery({
    queryKey: ['factoryEnergyLatest', resolvedCode],
    queryFn: () => getFactoryEnergyLatest(resolvedCode.value),
    enabled: computed(() => authStore.isLoggedIn && Boolean(resolvedCode.value)),
  });
}
