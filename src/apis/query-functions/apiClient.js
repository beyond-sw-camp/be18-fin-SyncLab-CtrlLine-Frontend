import axios from 'axios';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { useAuthStore } from '@/stores/useAuthStore';

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
    const authStore = useAuthStore();
    const authHeader = response.headers['authorization'];

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      authStore.setToken(token);
    }

    return response;
  },
  async error => {
    const authStore = useAuthStore();
    const router = useRouter();

    if (
      error.response?.status === 401 &&
      !error.config._retry &&
      !error.config.url.includes('/auth/token/refresh')
    ) {
      error.config._retry = true;

      try {
        const response = await apiClient.post('/auth/token/refresh');
        const newToken = response.headers['authorization']?.split(' ')[1];

        console.log('newToken', newToken);

        if (newToken) {
          authStore.setToken(newToken);
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(error.config);
        }
      } catch (refreshError) {
        if (refreshError.response.data.code === 'INVALID_REFRESH_TOKEN') {
          toast.error('로그인 세션이 만료되었습니다.\n다시 로그인을 진행해 주세요.');
        }
        authStore.clearAuth();
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
