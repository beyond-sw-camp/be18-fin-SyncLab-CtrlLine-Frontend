import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getProcess } from '@/apis/query-functions/process';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProcess(processCode) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['process', processCode],
    queryFn: () => getProcess(processCode),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
