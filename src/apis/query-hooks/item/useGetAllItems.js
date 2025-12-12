import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getItemList } from '@/apis/query-functions/item';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetAllItems(enabledRef) {
  const authStore = useAuthStore();

  const queryEnabled = computed(() => {
    if (!authStore.isLoggedIn) return false;
    if (!enabledRef) return true;

    return Boolean(unref(enabledRef));
  });

  return useQuery({
    queryKey: ['itemList', 'all'],
    queryFn: () =>
      getItemList({
        page: 0,
        size: 9999,
        sort: ['itemCode,asc'],
      }),
    enabled: queryEnabled,
  });
}
