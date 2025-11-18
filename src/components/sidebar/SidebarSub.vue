<template>
  <div
    class="ml-3"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="[isActiveSub ? 'bg-primary-700 text-white rounded' : '']"
  >
    <div
      class="flex items-center justify-between py-1.5 px-2 cursor-pointer rounded hover:bg-primary-400 transition"
    >
      <span>{{ icon }} {{ label }}</span>
      <span>{{ showChildren ? '▾' : '▸' }}</span>
    </div>

    <transition name="fade">
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

// ":param" 포함된 path 제외
const filteredChildren = computed(() => {
  const role = userStore.userRole;

  return props.children.filter(child => {
    // (1) 상세조회(:id) 숨기기
    if (child.to?.includes(':')) return false;

    // (2) role 기반 숨기기 (ADMIN만 접근 가능한 메뉴)
    if (child.role && child.role !== role) return false;

    // (3) 그 외는 모두 보임
    return true;
  });
});

// 현재 route가 하위 children 중 하나라도 포함하면 강조
const isActiveSub = computed(() => props.children?.some(c => route.path.startsWith(c.to)));

const showChildren = computed(() => isHovered.value || isActiveSub.value);
</script>
