import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { deleteProductionPlan } from '@/apis/query-functions/productionPlan';

export default function useDeleteProductionPlan() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: productionPlanId => deleteProductionPlan(productionPlanId),
    onSuccess: () => {
      toast.success('생산게획을 삭제했습니다.');
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanScheduleList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanAll'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanBoundary'] });
      router.push('/production-management/production-plans');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
