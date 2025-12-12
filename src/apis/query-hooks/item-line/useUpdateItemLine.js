import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { unref } from 'vue';
import { toast } from 'vue-sonner';

import { updateItemLine } from '@/apis/query-functions/itemLine';

export default function useUpdateItemLine(lineCodeRef) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateItemLine(unref(lineCodeRef), params),
    onSuccess: () => {
      const currentLineCode = unref(lineCodeRef);
      toast.success('생산 가능 품목을 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['itemLineList', currentLineCode] });
    },
    onError: error => {
      const message = error?.response?.data?.message ?? '생산 가능 품목 수정에 실패했습니다.';
      toast.error(message);
    },
  });
}
