<template>
  <Button
    class="fixed z-10 right-10 bottom-10 bg-primary text-white rounded-full w-10 h-10 shadow-lg cursor-pointer transition-opacity duration-300"
    :class="showScrollToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    @click="scrollToTop"
  >
    <div class="flex flex-col items-center justify-center h-full">
      <ChevronsUpIcon />
    </div>
  </Button>
</template>

<script setup>
import { ChevronsUpIcon } from 'lucide-vue-next';
import { ref, onMounted, onUnmounted } from 'vue';

import { Button } from '@/components/ui/button';

const showScrollToTop = ref(false);
let hideTimer = null;

function handleScroll() {
  const scrolledDown = window.scrollY > 500;

  // 버튼 표시 여부 변경
  if (showScrollToTop.value !== scrolledDown) {
    showScrollToTop.value = scrolledDown;
  }

  // 스크롤이 멈추면 버튼 자동 숨김
  if (scrolledDown) {
    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {
      showScrollToTop.value = false;
    }, 500);
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  clearTimeout(hideTimer);
});
</script>
