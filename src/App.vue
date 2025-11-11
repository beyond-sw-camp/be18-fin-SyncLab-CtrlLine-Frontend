<template>
  <div class="min-h-screen">
    <component :is="layout">
      <router-view />
    </component>
  </div>
  <Toaster richColors />
  <VueQueryDevtools />
</template>

<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import { computed } from 'vue';

import { Toaster } from '@/components/ui/sonner';
import AuthLayout from '@/layouts/AuthLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const layout = computed(() => {
  const { isLoggedIn } = useAuthStore();
  if (isLoggedIn === false) {
    return AuthLayout;
  }

  if (isLoggedIn === true) return DefaultLayout;

  return AuthLayout;
});
</script>
