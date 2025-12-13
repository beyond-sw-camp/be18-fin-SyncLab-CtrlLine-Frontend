<template>
  <div class="relative mt-2 rounded" :class="[isActiveGroup ? 'bg-primary-700 text-white' : '']">
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
      <span @click.stop="togglePin" :class="isPinned ? 'text-emerald-200' : ''">
        {{ showChildren ? '▾' : '▸' }}
      </span>
    </div>

    <div v-if="showChildren" class="ml-4 mt-1 space-y-2 text-[13px]">
      <template v-for="item in filteredChildren" :key="item.label">
        <SidebarSub v-if="item.children" v-bind="item" />
        <SidebarLink v-else v-bind="item" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ChartGanttIcon, FolderKanban, SheetIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import SidebarLink from '@/components/sidebar/SidebarLink.vue';
import SidebarSub from '@/components/sidebar/SidebarSub.vue';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useUserStore } from '@/stores/useUserStore';

const props = defineProps({
  title: String,
  groupKey: String,
  children: Array,
  icon: String,
});

const route = useRoute();
const userStore = useUserStore();
const sidebarStore = useSidebarStore();

const isActiveGroup = computed(() => route.path.startsWith(`/${props.groupKey}`));

const isPinned = computed(() => sidebarStore.pinnedGroupKeys.has(props.groupKey));

const showChildren = computed(
  () => isPinned.value || isActiveGroup.value || sidebarStore.openGroupKeys.has(props.groupKey),
);

const filteredChildren = computed(() => {
  const role = userStore.userRole;
  return props.children.filter(child => {
    if (child.role === 'ADMIN' && role !== 'ADMIN') return false;
    return true;
  });
});

const ICON_COMPONENTS = {
  FolderKanban,
  ChartGanttIcon,
  SheetIcon,
};

function handleClick() {
  sidebarStore.toggleGroupOpen(props.groupKey);
}

function togglePin() {
  sidebarStore.toggleGroupPin(props.groupKey);
}
</script>

<style scoped></style>
