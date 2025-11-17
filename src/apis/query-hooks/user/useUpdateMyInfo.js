// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateMyInfo } from '@/apis/query-functions/user';

export default function useUpdateMyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateMyInfo(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInfo'] });
      toast.success('내 정보 수정을 완료했습니다.');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
