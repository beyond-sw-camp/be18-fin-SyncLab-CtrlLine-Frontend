import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';

import { getFactoryList } from '@/apis/query-functions/factory';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetFactoryList(initialFilters = {}) {
  const authStore = useAuthStore();
  const page = ref(1);
  const pageSize = ref(10);
  const filters = ref(initialFilters);
  const fixedSort = [{ sortBy: 'factoryCode', direction: 'asc' }];

  const queryParams = computed(() => ({
    ...filters.value,
    page: page.value - 1,
    size: pageSize.value,
    sort: fixedSort,
  }));

  const { isPending, isError, data, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['factoryList', queryParams],
    queryFn: () => getFactoryList(queryParams.value),
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
    isPending,
    isError,
    data,
    error,
    isFetching,
    isPlaceholderData,
    page,
    pageSize,
    filters,
    prevPage,
    nextPage,
    firstPage,
    lastPage,
  };
}
