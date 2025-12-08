import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { createProductionPlanEndTime } from '@/apis/query-functions/productionPlan';

export default function useCreateProductionPlanEndTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => createProductionPlanEndTime(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionPlanScheduleList'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
