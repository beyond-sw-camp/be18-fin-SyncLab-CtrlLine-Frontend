import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getUserList } from '@/apis/query-functions/user';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetUserList(initialFilters = {}) {
  const authStore = useAuthStore();
  const page = ref(1);
  const pageSize = ref(10);

  const filters = reactive({
    userEmail: initialFilters.userEmail ?? '',
    userDepartment: initialFilters.userDepartment ?? null,
    userPhoneNumber: initialFilters.userPhoneNumber ?? '',
    userStatus: initialFilters.userStatus ?? null,
    userRole: initialFilters.userRole ?? null,
  });
  const fixedSort = ['empNo,asc', 'name,asc'];

  const queryParams = computed(() => {
    const cleaned = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        cleaned[key] = value;
      }
    });

    cleaned.page = page.value - 1;
    cleaned.size = pageSize.value;
    cleaned.sort = fixedSort;

    return cleaned;
  });

  const { data, isPlaceholderData, refetch } = useQuery({
    queryKey: ['userList', queryParams],
    queryFn: () => getUserList(queryParams.value),
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
