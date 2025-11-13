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

const authStore = useAuthStore();

const layout = computed(() => {
  if (authStore.isLoggedIn === false) {
    return AuthLayout;
  }

  if (authStore.isLoggedIn === true) return DefaultLayout;

  return AuthLayout;
});
</script>
