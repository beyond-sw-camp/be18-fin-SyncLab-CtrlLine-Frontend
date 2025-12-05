import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateProcessStatusList } from '@/apis/query-functions/process';

export default function useUpdateProcessStatusList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateProcessStatusList(params),
    onSuccess: () => {
      toast.success('공정 사용여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['processList'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
