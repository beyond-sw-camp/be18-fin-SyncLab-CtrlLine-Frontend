import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getDefective } from '@/apis/query-functions/defective';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetDefective(planDefectiveId) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['defective', planDefectiveId],
    queryFn: () => getDefective(planDefectiveId),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
