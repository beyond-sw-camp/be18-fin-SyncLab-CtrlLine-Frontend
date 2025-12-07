import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateLineStatusList } from '@/apis/query-functions/line';

export default function useUpdateLineStatusList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateLineStatusList(params),
    onSuccess: () => {
      toast.success('라인 사용여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['line'] });
      queryClient.invalidateQueries({ queryKey: ['lineList'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
