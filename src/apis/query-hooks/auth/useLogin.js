import { useMutation } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { login } from '@/apis/query-functions/auth';
import { getMyInfo } from '@/apis/query-functions/user';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';

export default function useLogin() {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  const router = useRouter();
  return useMutation({
    mutationFn: params => login(params),
    onSuccess: async response => {
      const token = response.headers['authorization']?.split(' ')[1];

      if (!token) {
        toast.error('로그인에 실패했습니다.');
        return;
      }

      authStore.setToken(token);

      const myInfo = await getMyInfo();

      userStore.setUser({
        id: myInfo.id,
        empNo: myInfo.empNo,
        userName: myInfo.userName,
        userRole: myInfo.userRole,
        userEmail: myInfo.userEmail,
      });

      toast.success('로그인에 성공했습니다.');
      router.push('/dashboard');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
