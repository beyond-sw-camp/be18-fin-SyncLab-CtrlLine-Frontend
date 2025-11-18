import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getMyInfo } from '@/apis/query-functions/user';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetMyInfo() {
  const authStore = useAuthStore();
  return useQuery({
    queryKey: ['myInfo'],
    queryFn: () => getMyInfo(),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
