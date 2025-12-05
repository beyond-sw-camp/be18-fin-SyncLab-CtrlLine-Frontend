import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateItemStatusList } from '@/apis/query-functions/item';

export default function useUpdateItemStatusList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateItemStatusList(params),
    onSuccess: () => {
      toast.success('품목 사용여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['itemList'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
