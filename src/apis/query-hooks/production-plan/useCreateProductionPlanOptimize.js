import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { createProductionPlanOptimize } from '@/apis/query-functions/productionPlan';

export default function useCreateProductionPlanOptimize(lineCode) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => createProductionPlanOptimize(lineCode, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanScheduleList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanAll'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanBoundary'] });
      toast.info('생산계획을 최적화를 적용했습니다.');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
