import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getItemList } from '@/apis/query-functions/item';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetItemList(initialFilters = {}) {
  const authStore = useAuthStore();
  const page = ref(1);
  const pageSize = ref(10);

  const filters = reactive({
    itemCode: initialFilters.itemCode ?? '',
    itemName: initialFilters.itemName ?? '',
    itemUnit: initialFilters.itemUnit ?? '',
    itemStatus: initialFilters.itemStatus ?? null,
    itemSpecification: initialFilters.itemSpecification ?? '',
    isActive: initialFilters.isActive ?? null,
  });

  const fixedSort = ['itemCode, asc'];

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
    queryKey: ['itemList', queryParams],
    queryFn: () => getItemList(queryParams.value),
    placeholderData: keepPreviousData,
    enabled: computed(() => authStore.isLoggedIn),
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
