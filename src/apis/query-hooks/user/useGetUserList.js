import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';

import { getUserList } from '@/apis/query-functions/user';

export default function useGetUserList(initialFilters = {}) {
  const page = ref(1);
  const pageSize = ref(10);
  const filters = ref(initialFilters);
  const fixedSort = [{ sortBy: 'empNo', direction: 'asc' }];

  const queryParams = computed(() => ({
    ...filters.value,
    page: page.value - 1,
    size: pageSize.value,
    sort: fixedSort,
  }));

  const { isPending, isError, data, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['userList', queryParams],
    queryFn: () => getUserList(queryParams.value),
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
