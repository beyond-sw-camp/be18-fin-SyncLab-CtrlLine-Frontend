import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, reactive, ref } from 'vue';

import { getEquipmentList } from '@/apis/query-functions/equipment';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetEquipmentList(initialFilters = {}) {
    // 로그인 상태 확인
    const authStore = useAuthStore();
    // 페이지네이션 상태
    const page = ref(1);
    const pageSize = ref(10);

  // 검색 필터 (초기 값 있으면 반영)
  // 드롭 다운 형식은 ??, null
  // 문자열로 검색하는 필터는 ??, ''
  const filters = reactive({
    equipmentName: initialFilters.equipmentName ?? '',
    equipmentType: initialFilters.equipmentType ?? null,
    userName: initialFilters.userName ?? '',
    userDepartment: initialFilters.userDepartment ?? null,
    isActive: initialFilters.isActive ?? null,
  });

  // 정렬 조건(설비코드로 오름차순 고정)
  const fixedSort = ['equipmentCode,asc'];

  // computed: filters, page, pageSize 기반 쿼리 파라미터 생성
  // cleand: 빈 값 필터 제거 + 페이지 0부터 시작 변환 + 고정 정렬 조건 추가
  const queryParams = computed(() => {
    const cleaned = {};

    // 빈 값 필터 제거
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

  // react-query data fetch
  const { data, isPlaceholderData, refetch } = useQuery({
    // queryParameters 변경 시 자동 refetch
    queryKey: ['equipmentList', queryParams],
    // API 호출 함수
    queryFn: () => getEquipmentList(queryParams.value),
    // 로그인 상태에서만 활성화
    enabled: computed(() => authStore.isLoggedIn),
    placeholderData: keepPreviousData,
  });

    // 이전 페이지로 이동
    const prevPage = () => {
    if (page.value > 1) {
        page.value--;
    }
    };

    // 다음 페이지로 이동
    const nextPage = () => {
    const totalPages = data?.value?.pageInfo?.totalPages ?? 1;
    if (!isPlaceholderData.value && page.value < totalPages) {
        page.value++;
    }
    };

    // 첫 페이지로 이동
    const firstPage = () => {
    page.value = 1;
    };

    // 마지막 페이지로 이동
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
