import { useQuery } from '@tanstack/vue-query';
import { computed, reactive } from 'vue';

import { getProductionPlanAll } from '@/apis/query-functions/productionPlan';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPlanList(initialFilters = {}) {
  const authStore = useAuthStore();
  const fixedSort = ['documentNo,desc'];

  const filters = reactive({
    factoryName: initialFilters.factoryName ?? '',
    lineName: initialFilters.lineName ?? '',
    salesManagerName: initialFilters.salesManagerName ?? '',
    productionManagerName: initialFilters.productionManagerName ?? '',
    itemCode: initialFilters.itemCode ?? '',
    itemName: initialFilters.itemName ?? '',
    dueDate: initialFilters.dueDate ?? null,
    startTime: initialFilters.startTime ?? null,
    endTime: initialFilters.endTime ?? null,
  });

  const queryParams = computed(() => {
    const cleaned = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    cleaned.sort = fixedSort;

    return cleaned;
  });

  const { data, refetch } = useQuery({
    queryKey: ['productionPlanAll', queryParams],
    queryFn: () => getProductionPlanAll(queryParams.value),
    enabled: computed(() => authStore.isLoggedIn),
  });

  return {
    data,
    refetch,
    filters,
  };
}
