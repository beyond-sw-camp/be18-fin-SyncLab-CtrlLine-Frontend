import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateProductionPlanStatusList } from '@/apis/query-functions/productionPlan';

export default function useUpdateProductionPlanStatusList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateProductionPlanStatusList(params),
    onSuccess: () => {
      toast.success('생산게획 상태를 일괄 변경했습니다.');
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanScheduleList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanAll'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanBoundary'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
