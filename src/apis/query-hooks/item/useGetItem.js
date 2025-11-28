import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getItem } from '@/apis/query-functions/item';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetItem(itemId) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
