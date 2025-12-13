<template>
  <aside class="w-64 bg-primary text-white flex flex-col">
    <div class="p-4 font-bold text-lg flex items-center gap-2 border-b border-primary-700">
      메뉴
    </div>

    <nav class="flex-1 overflow-y-auto py-2 text-sm hide-scrollbar">
      <RouterLink
        to="/dashboard"
        active-class="bg-primary-600 text-white font-semibold"
        class="flex cursor-pointer px-2 py-1.5 rounded transition-all select-none hover:bg-primary-400 hover:font-semibold"
      >
        대시보드
      </RouterLink>
      <SidebarGroup title="기초 관리" group-key="base-management" :children="baseManagement" />
      <SidebarGroup
        title="생산 관리"
        group-key="production-management"
        :children="productionManagement"
      />
      <SidebarGroup title="출력물" group-key="production-report" :children="productionReport" />
    </nav>
    <div class="border-t border-primary-700 py-1.5 px-2 text-[10px] flex flex-col gap-0.5">
      <p>Copyright {{ new Date().getFullYear() }}. CtrlLine. All rights reserved.</p>
    </div>
  </aside>
</template>

<script setup>
import { watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import SidebarGroup from '@/components/sidebar/SidebarGroup.vue';
import { baseManagement, productionManagement, productionReport } from '@/constants/category';
import { useSidebarStore } from '@/stores/useSidebarStore';

const route = useRoute();
const sidebarStore = useSidebarStore();

function getTopKey(path) {
  // /production-report/defectives -> production-report
  return path.split('/')[1] || null;
}

watch(
  () => route.path,
  path => {
    sidebarStore.syncRoute(getTopKey(path));
  },
  { immediate: true },
);
</script>

<style></style>
