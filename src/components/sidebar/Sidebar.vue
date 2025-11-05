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

const baseManagement = [
  {
    label: '👤 사용자 관리',
    children: [
      { label: '사용자 목록 조회', to: '/base-management/users' },
      { label: '사용자 등록', to: '/base-management/users/new' },
    ],
  },
  {
    label: '📦 품목 관리',
    children: [
      { label: '품목 목록 조회', to: '/base-management/items' },
      { label: '품목 등록', to: '/base-management/items/new' },
    ],
  },
  {
    label: '🏭 공장 관리',
    children: [
      { label: '공장 목록 조회', to: '/base-management/factories' },
      { label: '공장 등록', to: '/base-management/factories/new' },
    ],
  },
  {
    label: '🔧 라인 관리',
    children: [
      { label: '라인 목록 조회', to: '/base-management/lines' },
      { label: '라인 등록', to: '/base-management/lines/new' },
    ],
  },
  {
    label: '🧰 설비 관리',
    children: [
      { label: '설비 목록 조회', to: '/base-management/equipments' },
      { label: '설비 등록', to: '/base-management/equipments/new' },
    ],
  },
  {
    label: '⚙️ 공정 관리',
    children: [
      { label: '공정 목록 조회', to: '/base-management/processes' },
      { label: '공정 등록', to: '/base-management/processes/new' },
    ],
  },
  { label: '공장 계층 구조도', to: '/base-management/factory-structure' },
];

const productionManagement = [
  {
    label: '🗓 생산계획 관리',
    children: [
      { label: '생산계획 목록 조회', to: '/production-management/production-plans' },
      { label: '생산계획 등록', to: '/production-management/production-plans/new' },
    ],
  },
  {
    label: '📦 생산실적 관리',
    children: [
      { label: '생산실적 목록 조회', to: '/production-management/production-performances' },
    ],
  },
  {
    label: '🚨 불량 관리',
    children: [{ label: '불량 목록 조회', to: '/production-management/defectives' }],
  },
  {
    label: '#️⃣ Lot No. 관리',
    children: [{ label: 'Lot No. 목록 조회', to: '/production-management/lot' }],
  },
];

const productionReport = [
  { label: '생산 계획 현황', to: '/production-report/production-plans/all' },
  { label: '생산 실적 현황', to: '/production-report/production-performances/all' },
  { label: '불량 현황', to: '/production-report/defectives/all' },
  { label: '로그 현황', to: '/production-report/logs/all' },
];
</script>
