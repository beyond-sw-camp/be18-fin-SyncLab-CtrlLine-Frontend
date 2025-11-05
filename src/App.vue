<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import AuthLayout from '@/layouts/AuthLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const route = useRoute();
// 로그인 상태 (실제로는 store나 cookie 기반으로 관리)
const isLoggedIn = ref(true);

const layout = computed(() => {
  if (route.meta.requiresAuth === false) {
    return AuthLayout;
  }

  if (route.meta.requiresAuth && !isLoggedIn.value) return AuthLayout;

  return DefaultLayout;
});
</script>
