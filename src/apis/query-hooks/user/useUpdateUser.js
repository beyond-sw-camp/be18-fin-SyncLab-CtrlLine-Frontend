// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateUser } from '@/apis/query-functions/user';

export default function useLogin(userId) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateUser(userId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userList'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('사용자 수정을 완료했습니다.');
      router.push('/base-management/users');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
