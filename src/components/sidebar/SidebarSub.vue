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
        <SidebarLink v-for="child in children" :key="child.label" v-bind="child" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import SidebarLink from '@/components/sidebar/SidebarLink.vue';

const props = defineProps({
  icon: String,
  label: String,
  children: Array,
});

const route = useRoute();
const isHovered = ref(false);

// 현재 route가 하위 children 중 하나라도 포함하면 강조
const isActiveSub = computed(() => props.children?.some(c => route.path.startsWith(c.to)));

const showChildren = computed(() => isHovered.value || isActiveSub.value);
</script>
