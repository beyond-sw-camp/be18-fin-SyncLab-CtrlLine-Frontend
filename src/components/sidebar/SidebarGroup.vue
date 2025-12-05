<template>
  <div
    class="relative mt-2 rounded"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="[isActiveGroup ? 'bg-primary-700 text-white' : '']"
  >
    <div
      @click="handleClick"
      class="flex items-center justify-between py-1.5 px-2 cursor-pointer hover:bg-primary-400 transition"
    >
      <div class="flex gap-1 items-center">
        <component
          v-if="icon && ICON_COMPONENTS[icon]"
          :is="ICON_COMPONENTS[icon]"
          class="w-5 h-5 text-gray-300"
        />
        <span class="font-semibold">{{ title }}</span>
      </div>

      <!-- 고정 상태 표시 -->
      <span :class="isPinned ? 'text-blue-300' : ''">
        {{ showChildren ? '▾' : '▸' }}
      </span>
    </div>

    <transition name="slide-fade">
      <div v-if="showChildren" class="ml-4 mt-1 space-y-2 text-[13px]">
        <template v-for="item in children" :key="item.label">
          <SidebarSub v-if="item.children" v-bind="item" />
          <SidebarLink v-else v-bind="item" />
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ChartGanttIcon, FolderKanban, SheetIcon } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import SidebarLink from '@/components/sidebar/SidebarLink.vue';
import SidebarSub from '@/components/sidebar/SidebarSub.vue';

const props = defineProps({
  title: String,
  groupKey: String,
  children: Array,
  icon: String,
});

const route = useRoute();
const isHovered = ref(false);
const isPinned = ref(false); // 클릭으로 고정된 상태
let closeTimer = null;

const isActiveGroup = computed(() => route.path.startsWith(`/${props.groupKey}/`));

// 호버 중이거나, 고정되었거나, 현재 활성 경로면 열림
const showChildren = computed(() => isHovered.value || isPinned.value || isActiveGroup.value);

const ICON_COMPONENTS = {
  FolderKanban,
  ChartGanttIcon,
  SheetIcon,
};

function handleMouseEnter() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  isHovered.value = true;
}

function handleMouseLeave() {
  // 고정되어 있으면 닫지 않음
  if (isPinned.value) return;

  closeTimer = setTimeout(() => {
    isHovered.value = false;
  }, 500);
}

function handleClick() {
  // 클릭 시 고정 상태 토글
  isPinned.value = !isPinned.value;

  // 고정 해제 시 호버도 해제
  if (!isPinned.value) {
    isHovered.value = false;
  }
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}
</style>
