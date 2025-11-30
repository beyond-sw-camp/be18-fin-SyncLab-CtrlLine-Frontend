import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { deleteProductionPlanList } from '@/apis/query-functions/productionPlan';

export default function useDeleteProductionPlanList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planIds => deleteProductionPlanList(planIds),
    onSuccess: () => {
      toast.success('생산게획을 일괄 삭제했습니다.');
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
