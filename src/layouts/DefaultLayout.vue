<template>
  <div class="flex flex-col min-h-screen">
    <TopNav class="fixed top-0 left-0 right-0 z-50" />
    <Separator />
    <div class="flex flex-1">
      <Sidebar class="fixed top-14 overflow-y-auto h-[calc(100vh-56px)] z-50" />
      <main class="flex-1 bg-muted/20 p-4 overflow-y-auto ml-64 mt-14">
        <div class="space-y-10">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/sidebar/Sidebar.vue';
import TopNav from '@/components/topnav/TopNav.vue';
import { Separator } from '@/components/ui/separator';
</script>
