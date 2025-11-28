import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getProductionPlanList } from '@/apis/query-functions/productionPlan';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPlanList(currentStatus, initialFilters = {}) {
  const authStore = useAuthStore();
  const page = ref(1);
  const pageSize = ref(10);
  const fixedSort = ['documentNo,desc'];

  const filters = reactive({
    factoryName: initialFilters.factoryName ?? '',
    salesManagerName: initialFilters.salesManagerName ?? '',
    productionManagerName: initialFilters.productionManagerName ?? '',
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

    if (currentStatus.value !== 'TOTAL') {
      cleaned.status = currentStatus.value;
    }

    cleaned.page = page.value - 1;
    cleaned.size = pageSize.value;
    cleaned.sort = fixedSort;

    return cleaned;
  });

  const { data, isPlaceholderData, refetch } = useQuery({
    queryKey: ['productionPlanList', queryParams],
    queryFn: () => getProductionPlanList(queryParams.value),
    enabled: computed(() => authStore.isLoggedIn),
    placeholderData: keepPreviousData,
  });

  const prevPage = () => {
    if (page.value > 1) {
      page.value--;
    }
  };

  const nextPage = () => {
    const totalPages = data?.value?.pageInfo?.totalPages ?? 1;
    if (!isPlaceholderData.value && page.value < totalPages) {
      page.value++;
    }
  };

  const firstPage = () => {
    page.value = 1;
  };

  const lastPage = () => {
    const totalPages = data?.value?.pageInfo?.totalPages ?? 1;
    page.value = totalPages;
  };

  return {
    data,
    refetch,
    page,
    pageSize,
    filters,
    prevPage,
    nextPage,
    firstPage,
    lastPage,
  };
}
