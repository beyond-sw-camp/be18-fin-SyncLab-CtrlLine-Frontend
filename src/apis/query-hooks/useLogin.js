// @ts-nocheck
import { useMutation } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { login } from '@/apis/query-functions/auth';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useLogin() {
  const authStore = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: params => login(params),
    onSuccess: response => {
      const token = response.headers['authorization']?.split(' ')[1];
      if (token) {
        authStore.setToken(token);
        toast.success('로그인에 성공했습니다.');
        router.push('/dashboard');
      } else {
        toast.error('로그인에 실패했습니다.');
      }
    },
    onError: error => {
      if (error.status === 401) {
        toast.error(error.response.data.message);
      }
    },
  });
}
