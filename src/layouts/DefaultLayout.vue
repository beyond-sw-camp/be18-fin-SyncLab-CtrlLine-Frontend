<template>
  <div class="flex flex-col min-h-screen">
    <TopNav />
    <Separator />
    <div class="flex flex-1">
      <Sidebar />
      <main class="flex-1 bg-muted/20 p-3 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { Separator } from '@/components/ui/separator';
import Sidebar from '@/components/sidebar/Sidebar.vue';
import TopNav from '@/components/topnav/TopNav.vue';
</script>
