import { useMutation, useQueryClient } from '@tanstack/vue-query';

import apiClient from '@/apis/query-functions/apiClient';

export default function useUpdatePerformanceRemark(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ remark }) => apiClient.patch(`/production-performances/${id}`, { remark }),

    onSuccess: () => {
      // 상세조회 다시 로딩
      queryClient.invalidateQueries({
        queryKey: ['productionPerformanceDetail', id],
      });
    },
  });
}
