import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getItemLineList } from '@/apis/query-functions/itemLine';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetItemLineList(lineCodeRef, enabledRef) {
  const authStore = useAuthStore();
  const resolvedLineCode = computed(() => unref(lineCodeRef));

  const queryEnabled = computed(() => {
    const baseEnabled = authStore.isLoggedIn && Boolean(resolvedLineCode.value);
    if (!enabledRef) return baseEnabled;

    return baseEnabled && Boolean(unref(enabledRef));
  });

  const queryKey = computed(() => ['itemLineList', resolvedLineCode.value]);

  return useQuery({
    queryKey,
    queryFn: () => getItemLineList(resolvedLineCode.value),
    enabled: queryEnabled,
  });
}
