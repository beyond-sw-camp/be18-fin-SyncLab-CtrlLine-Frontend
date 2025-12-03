import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getDefectiveDetail } from '@/apis/query-functions/defective';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetDefective(planDefectiveId) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['defective', planDefectiveId],
    queryFn: () => getDefectiveDetail(planDefectiveId),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
