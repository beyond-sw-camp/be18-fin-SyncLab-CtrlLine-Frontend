import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getUser } from '@/apis/query-functions/user';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetUser(userId) {
  const authStore = useAuthStore();
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
