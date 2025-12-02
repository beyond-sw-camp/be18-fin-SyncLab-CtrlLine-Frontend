import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getDefective } from '@/apis/query-functions/defective';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetDefective(id) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['defective', id],
    queryFn: () => getDefective(id),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
