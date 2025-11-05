<template>
  <div class="flex min-h-screen">
    <!-- 로그인 후에만 Sidebar 노출 -->
    <RootLayout v-if="isLoggedIn" />

    <main class="flex-1 bg-muted/20 p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import RootLayout from '@/layouts/RootLayout.vue';

// 로그인 상태 (실제로는 store나 cookie 기반으로 관리)
const isLoggedIn = ref(true);
</script>
