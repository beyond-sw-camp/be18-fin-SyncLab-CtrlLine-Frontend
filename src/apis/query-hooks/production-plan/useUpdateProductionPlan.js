import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateProductionPlan } from '@/apis/query-functions/productionPlan';

export default function useUpdateProductionPlan(productionPlanId) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: params => updateProductionPlan(productionPlanId, params),
    onSuccess: () => {
      toast.success('생산계획을 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['productionPlan', productionPlanId] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
      router.push('/production-management/production-plans');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
