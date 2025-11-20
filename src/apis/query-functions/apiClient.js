import axios from 'axios';
import { toast } from 'vue-sonner';

import router from '@/routers';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 5000,
  withCredentials: true,
});

console.log(import.meta.env.VITE_API_BASE_URL);

// 요청 인터셉터
apiClient.interceptors.request.use(
  config => {
    const authStore = useAuthStore();

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const authStore = useAuthStore();
    const userStore = useUserStore();

    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const response = await apiClient.post('/auth/token/refresh');
        const newToken = response.headers['authorization']?.split(' ')[1];

        if (newToken) {
          authStore.setToken(newToken);
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          console.log('newToken', newToken);
          return apiClient(error.config);
        }
      } catch (refreshError) {
        if (refreshError.response.data.code === 'INVALID_REFRESH_TOKEN') {
          toast.error('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
        }

        authStore.clearAuth();
        userStore.clearUser();
        await router.push('/login');
        console.log('로그아웃 완료');

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
