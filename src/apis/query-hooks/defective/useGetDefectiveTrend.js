import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getDefectiveAll } from '@/apis/query-functions/defective';
import { useAuthStore } from '@/stores/useAuthStore';
const resolveValue = source => {
  if (typeof source === 'function') {
    try {
      return source();
    } catch {
      return undefined;
    }
  }
  return unref(source);
};

export default function useGetDefectiveTrend(factoryCodeRef, options = {}) {
  const authStore = useAuthStore();
  const resolvedFactoryCode = computed(() => resolveValue(factoryCodeRef));

  const lookBackWeeks = options.weeks;

  const params = computed(() => {
    const factoryCode = resolvedFactoryCode.value;
    if (!factoryCode) return null;

    if (typeof lookBackWeeks === 'number' && lookBackWeeks > 0) {
      const now = new Date();
      const past = new Date(now);
      past.setDate(past.getDate() - lookBackWeeks * 7);

      const toDate = now.toISOString().slice(0, 10);
      const fromDate = past.toISOString().slice(0, 10);

      return {
        factoryCode,
        fromDate,
        toDate,
      };
    }

    return { factoryCode };
  });

  const query = useQuery({
    queryKey: ['defectiveTrend', params],
    queryFn: () => getDefectiveAll(params.value),
    enabled: computed(() => authStore.isLoggedIn && Boolean(params.value)),
  });

  return query;
}
