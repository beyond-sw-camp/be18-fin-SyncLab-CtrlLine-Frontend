import { useQuery } from '@tanstack/vue-query';
import { reactive, computed } from 'vue';

import { getLogList } from '@/apis/query-functions/log';

export default function useGetLogList(initialFilters, enabledRef) {
  const filters = reactive({ ...initialFilters });

  const queryEnabled = computed(() => {
    if (enabledRef) return enabledRef.value;

    return Object.values(filters).some(v => v !== null && v !== '');
  });

  const query = useQuery({
    queryKey: ['logList', filters],
    queryFn: () => getLogList({ ...filters }),
    enabled: queryEnabled,
  });

  return {
    ...query,
    filters,
  };
}
