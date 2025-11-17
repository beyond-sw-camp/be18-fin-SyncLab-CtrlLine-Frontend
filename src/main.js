import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import 'vue-sonner/style.css';

import './style.css';
import router from '@/routers';
import { useAuthStore } from '@/stores/useAuthStore';

import App from './App.vue';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 5, // 5분 캐싱
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, {
  queryClient,
});

const authStore = useAuthStore();

const token = localStorage.getItem('access_token');
if (token) {
  authStore.setToken(token);
}

app.mount('#app');
