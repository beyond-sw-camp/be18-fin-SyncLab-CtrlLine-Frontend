import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getProductionPerformanceAll } from '@/apis/query-functions/productionPerformance';
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

export default function useGetProductionPerformanceAll(factoryCodeRef, options = {}) {
  const authStore = useAuthStore();
  const resolvedFactoryCode = computed(() => resolveValue(factoryCodeRef));
  const lookBackDays = computed(() => {
    const raw = Number(options.lookBackDays);
    return Number.isFinite(raw) && raw > 0 ? raw : 90;
  });

  const formatDateTime = date => {
    if (!(date instanceof Date)) return '';
    const pad = value => String(value).padStart(2, '0');
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join('-') + 'T' + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':');
  };

  const params = computed(() => {
    const factoryCode = resolvedFactoryCode.value;
    if (!factoryCode) return null;

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - lookBackDays.value);

    return {
      factoryCode,
      startDateTimeStart: formatDateTime(start),
      startDateTimeEnd: formatDateTime(now),
    };
  });

  return useQuery({
    queryKey: ['productionPerformanceAll', params],
    queryFn: () => getProductionPerformanceAll(params.value),
    enabled: computed(() => authStore.isLoggedIn && Boolean(params.value)),
  });
}
