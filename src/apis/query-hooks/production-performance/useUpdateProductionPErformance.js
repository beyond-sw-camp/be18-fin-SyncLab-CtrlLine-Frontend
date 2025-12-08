import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateProductionPerformance } from '@/apis/query-functions/productionPerformance';

export default function useUpdateProductionPerformance(id) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: params => updateProductionPerformance(id, params),
    onSuccess: () => {
      toast.success('생산 실적을 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['productionPerformance', id] });
      queryClient.invalidateQueries({ queryKey: ['productionPerformanceList'] });
      router.push('/production-management/production-performances');
    },
    onError: error => {
      // @ts-ignore
      toast.error(error.response.data.message);
    },
  });
}
