<template>
  <Button
    v-if="showScrollToTop"
    @click="scrollToTop"
    class="fixed z-10 right-10 bottom-10 bg-primary text-white rounded-full w-10 h-10 shadow-lg cursor-pointer"
    style="opacity: 1"
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
let scrollTimeout = null; // 스크롤 정지 타이머 복원
let hideTimeout = null; // 버튼 숨김 타이머 복원

function handleScroll() {
  const isScrolledDown = window.scrollY > 200;

  if (isScrolledDown) {
    showScrollToTop.value = true;
  } else {
    showScrollToTop.value = false;
  }

  clearTimeout(scrollTimeout);
  clearTimeout(hideTimeout);

  if (isScrolledDown) {
    scrollTimeout = setTimeout(() => {
      hideTimeout = setTimeout(() => {
        if (window.scrollY > 200) {
          showScrollToTop.value = false;
        }
      }, 400);
    }, 200);
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  // 컴포넌트 파괴 시 타이머 정리
  clearTimeout(scrollTimeout);
  clearTimeout(hideTimeout);
});
</script>
