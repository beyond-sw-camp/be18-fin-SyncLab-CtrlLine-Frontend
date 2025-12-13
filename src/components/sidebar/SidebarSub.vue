<template>
  <div class="ml-3" :class="[isActiveSub ? 'bg-primary-700 text-white rounded' : '']">
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
      <span @click.stop="togglePin" :class="isPinned ? 'text-emerald-200' : ''">
        {{ showChildren ? '▾' : '▸' }}
      </span>
    </div>

    <div v-if="showChildren" class="ml-3 mt-1 space-y-1">
      <SidebarLink
        v-for="child in filteredChildren"
        :key="child.label"
        :label="child.label"
        :to="child.to"
      />
    </div>
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import SidebarLink from '@/components/sidebar/SidebarLink.vue';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useUserStore } from '@/stores/useUserStore';

const props = defineProps({
  icon: String,
  label: String,
  children: Array,
});

const route = useRoute();
const userStore = useUserStore();
const sidebarStore = useSidebarStore();

const subKey = `sub:${props.label}`;

const isActiveSub = computed(() => props.children?.some(c => route.path.startsWith(c.to)));

const isPinned = computed(() => sidebarStore.pinnedSubKeys.has(subKey));

const showChildren = computed(
  () => isPinned.value || isActiveSub.value || sidebarStore.openSubKeys.has(subKey),
);

const filteredChildren = computed(() => {
  const role = userStore.userRole;
  return props.children.filter(child => {
    if (child.to?.includes(':')) return false;
    if (child.role && child.role !== role) return false;
    return true;
  });
});

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

function handleClick() {
  sidebarStore.toggleSubOpen(subKey);
}

function togglePin() {
  sidebarStore.toggleSubPin(subKey);
}
</script>

<style scoped></style>
