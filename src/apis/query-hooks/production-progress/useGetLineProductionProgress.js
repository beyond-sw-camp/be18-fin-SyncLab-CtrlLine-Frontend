import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getLineProductionProgress } from '@/apis/query-functions/productionProgress';
import { useAuthStore } from '@/stores/useAuthStore';

const resolveValue = source => {
  if (typeof source === 'function') {
    try {
      return source();
    } catch {
      return undefined;
    }
  }
  return unref(source);
};

export default function useGetLineProductionProgress(factoryCodeRef) {
  const authStore = useAuthStore();
  const resolvedFactoryCode = computed(() => resolveValue(factoryCodeRef));

  return useQuery({
    queryKey: ['lineProductionProgress', resolvedFactoryCode],
    queryFn: () => getLineProductionProgress(resolvedFactoryCode.value),
    enabled: computed(() => authStore.isLoggedIn && Boolean(resolvedFactoryCode.value)),
  });
}
