import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getDefectiveTypes } from '@/apis/query-functions/defective';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetDefectiveTypes(factoryCode) {
  const authStore = useAuthStore();
  const resolvedCode = computed(() => unref(factoryCode));

  return useQuery({
    queryKey: ['defectiveTypes', resolvedCode],
    queryFn: () => getDefectiveTypes(resolvedCode.value),
    enabled: computed(() => authStore.isLoggedIn && Boolean(resolvedCode.value)),
  });
}
