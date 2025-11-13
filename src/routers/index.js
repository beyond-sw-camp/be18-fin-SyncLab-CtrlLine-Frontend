import { createRouter, createWebHistory } from 'vue-router';

import Login from '@/pages/auth/Login.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/Index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/base-management',
    name: 'BaseManagement',
    meta: { requiresAuth: true },
    children: [
      // 등록 경로 추가 필요
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/pages/base-management/user/UserList.vue'),
      },
      {
        path: 'users/:userId',
        name: 'UserDetail',
        component: () => import('@/pages/base-management/user/UserDetail.vue'),
      },
      {
        path: 'users/new',
        name: 'CreateUser',
        component: () => import('@/pages/base-management/user/CreateUser.vue'),
      },
      {
        path: 'items',
        name: 'ItemList',
        component: () => import('@/pages/base-management/item/ItemList.vue'),
      },
      {
        path: 'factories',
        name: 'FactoryList',
        component: () => import('@/pages/base-management/factory/FactoryList.vue'),
      },
      {
        path: 'lines',
        name: 'LineList',
        component: () => import('@/pages/base-management/line/LineList.vue'),
      },
      {
        path: 'equipments',
        name: 'EquipmentList',
        component: () => import('@/pages/base-management/equipment/EquipmentList.vue'),
      },
      {
        path: 'processes',
        name: 'ProcessList',
        component: () => import('@/pages/base-management/process/ProcessList.vue'),
      },
      {
        path: 'factory-structure',
        name: 'FactoryStructure',
        component: () => import('@/pages/base-management/factory-structure/Index.vue'),
      },
    ],
  },
  {
    path: '/production-management',
    name: 'ProductionManagement',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'production-plans',
        name: 'ProductionPlanList',
        component: () =>
          import('@/pages/production-management/product-plan/ProductionPlanList.vue'),
      },
      {
        path: 'production-performances',
        name: 'ProductionPerformanceList',
        component: () =>
          import(
            '@/pages/production-management/production-performance/ProductionPerformanceList.vue'
          ),
      },
      {
        path: 'defectives',
        name: 'DefectiveList',
        component: () => import('@/pages/production-management/defective/DefectiveList.vue'),
      },
      {
        path: 'lots',
        name: 'LotList',
        component: () => import('@/pages/production-management/lot/LotList.vue'),
      },
    ],
  },
  {
    path: '/production-report',
    name: 'ProductionReport',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'production-plans/all',
        name: 'ReportProductionPlanList',
        component: () => import('@/pages/production-report/production-plan/ProductionPlanList.vue'),
      },
      {
        path: 'production-performances/all',
        name: 'ReportProductionPerformanceList',
        component: () =>
          import('@/pages/production-report/production-performance/ProductionPerformanceList.vue'),
      },
      {
        path: 'defectives/all',
        name: 'ReportDefectiveList',
        component: () => import('@/pages/production-report/defective/DefectiveList.vue'),
      },
      {
        path: 'logs/all',
        name: 'ReportLogList',
        component: () => import('@/pages/production-report/log/LogList.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.fullPath.match(/\/{2,}/)) next(to.fullPath.replace(/\/{2,}/g, '/'));

  const authStore = useAuthStore();
  authStore.getToken();

  if (!to.meta.requiresAuth && authStore.isLoggedIn) {
    next('/dashboard');
    return;
  }
  // 로그인 필요한 페이지인데 로그인 안 된 경우 → /login으로 이동
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login');
    return;
  }
  next();
});

export default router;
