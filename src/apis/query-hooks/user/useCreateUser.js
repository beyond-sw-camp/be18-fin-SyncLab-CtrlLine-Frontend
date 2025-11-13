// @ts-nocheck
import { useMutation } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { createUser } from '@/apis/query-functions/user';

export default function useCreateUser() {
  const router = useRouter();

  return useMutation({
    mutationFn: params => createUser(params),
    onSuccess: () => {
      toast.success('사용자 등록에 성공했습니다.');
      router.push('/base-management/users');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
