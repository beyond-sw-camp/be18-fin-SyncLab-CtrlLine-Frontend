// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { createUser } from '@/apis/query-functions/user';

export default function useCreateUser() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => createUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userList'] });
      toast.success('사용자 등록에 성공했습니다.');
      router.push('/base-management/users');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
