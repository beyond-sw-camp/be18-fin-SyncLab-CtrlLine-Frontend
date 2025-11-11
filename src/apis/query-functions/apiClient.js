import axios from 'axios';

import { useAuthStore } from '@/stores/useAuthStore';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 5000,
  withCredentials: true,
});

console.log(import.meta.env.VITE_API_BASE_URL);

// 요청 인터셉터
axios.interceptors.request.use(
  config => {
    const authStore = useAuthStore();

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
      console.log('20', authStore.accessToken);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
axios.interceptors.response.use(
  response => {
    const authStore = useAuthStore();
    const authHeader = response.headers['authorization'];
    if (authHeader?.startWidth('Bearer ')) {
      const token = authHeader.split(' ')[1];

      authStore.setToken(token);
    }
    return response;
  },
  error => {
    if (error.response?.stats === 401 && !error.config._retry) {
      error.config._retry = true;
      // refresh_token 으로 access_token 재발급
    }
    return Promise.reject(error);
  },
);

export default apiClient;
