// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateFactoryStatus } from '@/apis/query-functions/factory';

export default function useUpdateFactoryStatus(factoryCode) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: params => updateFactoryStatus(factoryCode, params),
    onSuccess: () => {
      toast.success('공장 사용 여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['factory', factoryCode] });
      queryClient.invalidateQueries({ queryKey: ['factoryList'] });
      router.push('/base-management/factories');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
