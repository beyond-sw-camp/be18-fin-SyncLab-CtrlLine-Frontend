import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateProductionPlanStatueList } from '@/apis/query-functions/productionPlan';

export default function useUpdateProductionPlanStatusList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateProductionPlanStatueList(params),
    onSuccess: () => {
      toast.success('생산게획 상태를 일괄 변경했습니다.');
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
