import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateProductionPlan } from '@/apis/query-functions/productionPlan';

export default function useUpdateProductionPlan(productionPlanId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateProductionPlan(params),
    onSuccess: data => {
      toast.success('생산계획을 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['productionPlan', productionPlanId] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanScheduleList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanAll'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanBoundary'] });

      return data;
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
