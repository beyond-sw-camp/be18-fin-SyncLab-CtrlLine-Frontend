import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getProductionPerformanceList } from '@/apis/query-functions/productionPerformance';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPerformanceList(initialFilters = {}) {
  const authStore = useAuthStore();
  const page = ref(1);
  const pageSize = ref(10);
  const fixedSort = ['documentNo,desc'];

  const filters = reactive({
    productionPlanDocumentNo: initialFilters.productionPlanDocumentNo ?? '',
    factoryCode: initialFilters.factoryCode ?? '',
    lineCode: initialFilters.lineCode ?? '',
    itemCode: initialFilters.itemCode ?? '',
    salesManagerNo: initialFilters.salesManagerNo ?? '',
    productionManagerNo: initialFilters.productionManagerNo ?? '',
    minPerformanceQty: initialFilters.minPerformanceQty ?? null,
    maxPerformanceQty: initialFilters.maxPerformanceQty ?? null,
    minDefectRate: initialFilters.minDefectRate ?? null,
    maxDefectRate: initialFilters.maxDefectRate ?? null,
  });

  const queryParams = computed(() => {
    const cleaned = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    cleaned.page = page.value - 1;
    cleaned.size = pageSize.value;
    cleaned.sort = fixedSort;

    return cleaned;
  });

  const { data, isPlaceholderData, refetch } = useQuery({
    queryKey: ['productionPerformanceList', queryParams],
    queryFn: () => getProductionPerformanceList(queryParams.value),
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
