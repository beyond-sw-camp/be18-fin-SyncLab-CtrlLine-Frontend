import { useQuery } from '@tanstack/vue-query';
import { computed, reactive } from 'vue';

import { getProductionPerformanceAll } from '@/apis/query-functions/productionPerformance';

export default function useGetProductionPerformanceReport(initialFilters, enabledRef) {
  const filters = reactive({ ...initialFilters });

  const queryEnabled = computed(() => {
    if (!enabledRef) {
      return Object.values(filters).some(value => value !== null && value !== '');
    }
    return enabledRef.value;
  });

  const query = useQuery({
    queryKey: ['productionPerformanceReport', filters],
    queryFn: () => getProductionPerformanceAll({ ...filters }),
    enabled: queryEnabled,
  });

  return {
    ...query,
    filters,
  };
}
