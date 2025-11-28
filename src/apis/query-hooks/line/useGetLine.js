import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getLine } from '@/apis/query-functions/line';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetLine(lineCode) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['line', lineCode],
    queryFn: () => getLine(lineCode),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
