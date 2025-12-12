import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateProductionPlanPreview } from '@/apis/query-functions/productionPlan';

export default function useUpdateProductionPlanPreview(productionPlanId) {
  return useMutation({
    mutationFn: params => updateProductionPlanPreview(productionPlanId, params),
    onSuccess: data => {
      toast.info('생산계획 조정 결과를 불러왔습니다.');
      return data;
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
