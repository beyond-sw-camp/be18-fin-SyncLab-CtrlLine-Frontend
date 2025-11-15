import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getFactory } from '@/apis/query-functions/factory';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetFactory(factoryCode) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['factory', factoryCode],
    queryFn: () => getFactory(factoryCode),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
