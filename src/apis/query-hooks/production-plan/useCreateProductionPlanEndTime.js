import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { createProductionPlanEndTime } from '@/apis/query-functions/productionPlan';

export default function useCreateProductionPlanEndTime(productionPlanId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => createProductionPlanEndTime(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionPlan', productionPlanId] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanScheduleList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanAll'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanBoundary'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
