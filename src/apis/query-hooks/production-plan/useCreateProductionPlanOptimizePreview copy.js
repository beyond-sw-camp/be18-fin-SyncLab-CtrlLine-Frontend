import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { createProductionPlanOptimizePreview } from '@/apis/query-functions/productionPlan';

export default function useCreateProductionPlanOptimizePreview() {
  return useMutation({
    mutationFn: lineCode => createProductionPlanOptimizePreview(lineCode),
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
