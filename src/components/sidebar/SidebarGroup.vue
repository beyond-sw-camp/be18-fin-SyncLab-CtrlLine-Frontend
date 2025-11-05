<template>
  <div
    class="relative mt-2 rounded"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="[isActiveGroup ? 'bg-primary-700 text-white' : '']"
  >
    <div
      class="flex items-center justify-between py-1.5 px-2 cursor-pointer hover:bg-primary-400 transition"
    >
      <span class="font-semibold">{{ title }}</span>
      <span>{{ showChildren ? '▾' : '▸' }}</span>
    </div>

    <transition name="fade">
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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import SidebarLink from '@/components/sidebar/SidebarLink.vue';
import SidebarSub from '@/components/sidebar/SidebarSub.vue';

const props = defineProps({
  title: String,
  groupKey: String,
  children: Array,
});

const route = useRoute();
const isHovered = ref(false);

// 현재 route가 이 그룹 내 경로를 포함하면 active 처리
const isActiveGroup = computed(() => route.path.startsWith(`/${props.groupKey}/`));

const showChildren = computed(() => isHovered.value || isActiveGroup.value);
</script>
