// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateMyInfo } from '@/apis/query-functions/user';
import { useUserStore } from '@/stores/useUserStore';

export default function useUpdateMyInfo() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userStore = useUserStore();

  return useMutation({
    mutationFn: params => updateMyInfo(params),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['myInfo'] });

      userStore.setUser({
        ...data,
        userName: data.userName,
      });

      router.push('/dashboard');
      toast.success('내 정보 수정을 완료했습니다.');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
