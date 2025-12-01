import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getDefective } from '@/apis/query-functions/defective';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetDefective(defectiveId) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['defective', defectiveId],
    queryFn: () => getDefective(defectiveId),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
