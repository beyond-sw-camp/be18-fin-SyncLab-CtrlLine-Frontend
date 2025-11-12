<template>
  <div class="flex items-center justify-center gap-1" v-if="props.totalPages > 0">
    <!-- 맨 앞으로 -->
    <Button
      variant="ghost"
      size="xs"
      type="button"
      class="cursor-pointer w-6"
      @click="firstPage"
      :disabled="props.modelValue === 1"
    >
      <ChevronsLeftIcon />
    </Button>

    <!-- 이전 -->
    <Button
      variant="ghost"
      type="button"
      size="xs"
      class="cursor-pointer w-6"
      @click="prevPage"
      :disabled="props.modelValue === 1"
    >
      <ChevronLeftIcon />
    </Button>

    <!-- 페이지 번호들 -->
    <div class="flex items-center gap-1">
      <Button
        v-for="p in visiblePages"
        :key="p"
        variant="ghost"
        type="button"
        size="xs"
        class="w-6"
        :class="{
          'bg-primary text-white font-semibold': p === props.modelValue,
          'text-gray-600': p !== props.modelValue,
        }"
        @click="goToPage(p)"
      >
        {{ p }}
      </Button>
    </div>

    <!-- 다음 -->
    <Button
      variant="ghost"
      type="button"
      size="xs"
      class="cursor-pointer w-6"
      @click="nextPage"
      :disabled="props.modelValue >= props.totalPages"
    >
      <ChevronRightIcon />
    </Button>

    <!-- 맨 뒤로 -->
    <Button
      variant="ghost"
      type="button"
      size="xs"
      class="cursor-pointer w-6"
      @click="lastPage"
      :disabled="props.modelValue >= props.totalPages"
    >
      <ChevronsRightIcon />
    </Button>
  </div>
</template>

<script setup>
import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from 'lucide-vue-next';
import { computed } from 'vue';

import { Button } from '@/components/ui/button';

// Props 정의
const props = defineProps({
  modelValue: { type: Number, required: true }, // 현재 페이지 (v-model)
  totalPages: { type: Number, required: true }, // 전체 페이지 수
  maxVisible: { type: Number, default: 5 }, // 보이는 버튼 개수
});

// Emit 정의
const emit = defineEmits(['update:modelValue']);

// 내부 computed
const visiblePages = computed(() => {
  const current = props.modelValue;
  const total = props.totalPages;
  const max = props.maxVisible;

  if (total <= 1) return [1];

  let start = Math.max(current - Math.floor(max / 2), 1);
  let end = start + max - 1;

  if (end > total) {
    end = total;
    start = Math.max(end - max + 1, 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// 페이지 이동 함수
const goToPage = p => {
  if (p >= 1 && p <= props.totalPages) emit('update:modelValue', p);
};
const firstPage = () => emit('update:modelValue', 1);
const lastPage = () => emit('update:modelValue', props.totalPages);
const prevPage = () => goToPage(props.modelValue - 1);
const nextPage = () => goToPage(props.modelValue + 1);
</script>
