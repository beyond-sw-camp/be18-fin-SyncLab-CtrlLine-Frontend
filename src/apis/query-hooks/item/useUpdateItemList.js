// 목록 조회에서 '사용여부' 업데이트

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateItem } from '@/apis/query-functions/item';

export default function useUpdateItem(itemId) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: params => updateItem(itemId, params),
    onSuccess: () => {
      toast.success('품목 사용여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['itemList'] });
      router.push('/base-management/items');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
