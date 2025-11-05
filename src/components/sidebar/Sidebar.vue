<template>
  <aside class="w-64 bg-primary text-white flex flex-col">
    <div class="p-4 font-bold text-lg flex items-center gap-2 border-b border-primary-700">
      📋 메뉴
    </div>

    <nav class="flex-1 overflow-y-auto py-2 text-sm">
      <SidebarLink label="🏭 대시보드" to="/dashboard" />
      <SidebarGroup title="🗂 기초 관리" group-key="base-management" :children="baseManagement" />
      <SidebarGroup
        title="📝 생산계획 관리"
        group-key="production-management"
        :children="productionManagement"
      />
      <SidebarGroup title="🧾 출력물" group-key="production-report" :children="productionReport" />
    </nav>
    <div class="border-t border-primary-700 p-4 text-sm flex items-center justify-between">
      ⚙ 설정
    </div>
  </aside>
</template>

<script setup>
import SidebarGroup from '@/components/sidebar/SidebarGroup.vue';
import SidebarLink from '@/components/sidebar/SidebarLink.vue';
import { baseManagement, productionManagement, productionReport } from '@/constants/category';
</script>
