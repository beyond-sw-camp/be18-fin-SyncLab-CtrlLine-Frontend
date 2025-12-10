import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getProductionPerformanceList } from '@/apis/query-functions/productionPerformance';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProductionPerformanceList(initialFilters = {}) {
  const authStore = useAuthStore();
  const page = ref(1);
  const pageSize = ref(10);
  const fixedSort = ['createdAt,desc'];

  const filters = reactive({
    documentDateFrom: initialFilters.documentDateFrom ?? null,
    documentDateTo: initialFilters.documentDateTo ?? null,

    productionPlanDocumentNo: initialFilters.productionPlanDocumentNo ?? '',
    defectiveDocumentNo: initialFilters.defectiveDocumentNo ?? '',
    lotNo: initialFilters.lotNo ?? '',

    factoryName: initialFilters.factoryName ?? '',
    lineName: initialFilters.lineName ?? '',
    lineCode: initialFilters.lineCode ?? '',
    itemCode: initialFilters.itemCode ?? '',
    itemName: initialFilters.itemName ?? '',

    salesManagerName: initialFilters.salesManagerNo ?? '',
    salesManagerNo: initialFilters.salesManagerNo ?? '',
    productionManagerName: initialFilters.producerManagerNo ?? '',
    productionManagerNo: initialFilters.productionManagerName ?? '',

    startTimeFrom: initialFilters.startTimeFrom ?? null,
    startTimeTo: initialFilters.startTimeTo ?? null,
    endTimeFrom: initialFilters.endTimeFrom ?? null,
    endTimeTo: initialFilters.endTimeTo ?? null,

    dueDateFrom: initialFilters.dueDateFrom ?? null,
    dueDateTo: initialFilters.dueDateTo ?? null,

    minTotalQty: initialFilters.minTotalQty ?? null,
    maxTotalQty: initialFilters.maxTotalQty ?? null,
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
