import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getFactoryEnvironmentLatest } from '@/apis/query-functions/factoryEnvironment';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetFactoryEnvironmentLatest(factoryCode) {
  const authStore = useAuthStore();
  const resolvedFactoryCode = computed(() => unref(factoryCode));

  return useQuery({
    queryKey: ['factoryEnvironmentLatest', resolvedFactoryCode],
    queryFn: () => getFactoryEnvironmentLatest(resolvedFactoryCode.value),
    enabled: computed(() => authStore.isLoggedIn && Boolean(resolvedFactoryCode.value)),
  });
}
