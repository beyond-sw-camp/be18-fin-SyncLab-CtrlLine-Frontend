// 공정 목록 조회
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getProcessList } from '@/apis/query-functions/process';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetProcessList(initialFilters = {}) {
  const authStore = useAuthStore();
  const page = ref(1);
  const pageSize = ref(10);
  const fixedSort = [{ sortBy: 'processCode', direction: 'asc' }];

  const filters = reactive({
    processName: initialFilters.processName ?? '',
    processCode: initialFilters.processCode ?? '',
    userName: initialFilters.userName ?? '',
    userDepartment: initialFilters.userDepartment ?? null,
    isActive: initialFilters.isActive ?? null,
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
    queryKey: ['processList', queryParams],
    queryFn: () => getProcessList(queryParams.value),
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
