import { useMutation } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { logout } from '@/apis/query-functions/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';

export default function useLogout() {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  const router = useRouter();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      authStore.clearAuth();
      userStore.clearUser();

      toast.success('로그아웃 되었습니다.');
      router.replace('/login');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
