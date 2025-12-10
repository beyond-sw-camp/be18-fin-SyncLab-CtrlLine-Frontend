import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getLotList } from '@/apis/query-functions/lot';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetLotList(initialFilters = {}, initialPage = 1) {
  const authStore = useAuthStore();
  const page = ref(initialPage);
  const pageSize = ref(10);
  const fixedSort = ['createdAt, desc'];

  const filters = reactive({
    lotNo: initialFilters.lotNo ?? '',
    itemCode: initialFilters.itemCode ?? '',
    factoryCode: initialFilters.factoryCode ?? '',
    lineCode: initialFilters.lineCode ?? '',
    performanceDocumentNo: initialFilters.performanceDocumentNo ?? '',
    createdAtFrom: initialFilters.createdAtFrom ?? null,
    createdAtTo: initialFilters.createdAtTo ?? null,
    updatedAtFrom: initialFilters.updatedAtFrom ?? null,
    updatedAtTo: initialFilters.updatedAtTo ?? null,
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
    queryKey: ['lotList', queryParams],
    queryFn: () => getLotList(queryParams.value),
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
