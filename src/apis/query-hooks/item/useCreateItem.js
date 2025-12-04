// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { createItem } from '@/apis/query-functions/item';

export default function useCreateItem() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => createItem(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itemList'] });
      toast.success('품목 등록에 성공했습니다.');
      router.push('/base-management/items');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
