// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateUser } from '@/apis/query-functions/user';
import { useUserStore } from '@/stores/useUserStore';

export default function useLogin(userId) {
  const router = useRouter();
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateUser(userId, params),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['userList'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });

      console.log('userId === userStore.id', userId === userStore.id);
      if (Number(userId) === Number(userStore.id)) {
        // 서버에서 반환된 실제 데이터로 업데이트
        userStore.setUser({
          ...data,
          userName: data.userName,
          userRole: data.userRole,
          userEmail: data.userEmail,
        });
      }

      toast.success('사용자 수정을 완료했습니다.');
      router.push('/base-management/users');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
