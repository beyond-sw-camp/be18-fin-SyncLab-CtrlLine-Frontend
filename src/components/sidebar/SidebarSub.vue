<template>
  <div
    class="ml-3"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="[isActiveSub ? 'bg-primary-700 text-white rounded' : '']"
  >
    <div
      @click="handleClick"
      class="flex items-center justify-between py-1.5 px-2 cursor-pointer rounded hover:bg-primary-400 transition"
    >
      <span class="flex gap-1 items-center">
        <component
          v-if="icon && ICON_COMPONENTS[icon]"
          :is="ICON_COMPONENTS[icon]"
          class="w-4 h-4 text-gray-300"
        />
        {{ label }}
      </span>
      <!-- 고정 상태 표시 -->
      <span :class="isPinned ? 'text-emerald-200' : ''">
        {{ showChildren ? '▾' : '▸' }}
      </span>
    </div>

    <transition name="slide-fade">
      <div v-if="showChildren" class="ml-3 mt-1 space-y-1">
        <SidebarLink
          v-for="child in filteredChildren"
          :key="child.label"
          :label="child.label"
          :to="child.to"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import {
  BugIcon,
  CableIcon,
  ChartNoAxesCombinedIcon,
  FactoryIcon,
  Grid3x2Icon,
  MicrochipIcon,
  PackageIcon,
  QrCodeIcon,
  SquareChartGanttIcon,
  UsersIcon,
} from 'lucide-vue-next';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import SidebarLink from '@/components/sidebar/SidebarLink.vue';
import { useUserStore } from '@/stores/useUserStore';

const props = defineProps({
  icon: String,
  label: String,
  children: Array,
});

const userStore = useUserStore();
const route = useRoute();
const isHovered = ref(false);
const isPinned = ref(false); // 클릭으로 고정된 상태
let closeTimer = null;

const filteredChildren = computed(() => {
  const role = userStore.userRole;

  return props.children.filter(child => {
    if (child.to?.includes(':')) return false;
    if (child.role && child.role !== role) return false;
    return true;
  });
});

const isActiveSub = computed(() => props.children?.some(c => route.path.startsWith(c.to)));

// 호버 중이거나, 고정되었거나, 현재 활성 경로면 열림
const showChildren = computed(() => isHovered.value || isPinned.value || isActiveSub.value);

const ICON_COMPONENTS = {
  UsersIcon,
  PackageIcon,
  FactoryIcon,
  Grid3x2Icon,
  CableIcon,
  MicrochipIcon,
  SquareChartGanttIcon,
  ChartNoAxesCombinedIcon,
  BugIcon,
  QrCodeIcon,
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
