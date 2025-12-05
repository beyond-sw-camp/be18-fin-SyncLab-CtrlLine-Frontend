import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { createProductionPlan } from '@/apis/query-functions/productionPlan';

export default function useCreateProductionPlan() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => createProductionPlan(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionPlanList'] });
      queryClient.invalidateQueries({ queryKey: ['productionPlanScheduleList'] });
      toast.success('생산계획 등록에 성공했습니다.');
      router.push('/production-management/production-plans');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
