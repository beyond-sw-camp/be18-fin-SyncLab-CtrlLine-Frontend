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
    path: '/users/me',
    name: 'MyInfo',
    component: () => import('@/pages/profile/MyInfo.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/base-management',
    name: 'BaseManagement',
    meta: { requiresAuth: true },
    children: [
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
        path: 'items/:itemId',
        name: 'ItemDetail',
        component: () => import('@/pages/base-management/item/ItemDetail.vue'),
      },
      {
        path: 'items/new',
        name: 'CreateItem',
        component: () => import('@/pages/base-management/item/CreateItem.vue'),
      },
      {
        path: 'factories',
        name: 'FactoryList',
        component: () => import('@/pages/base-management/factory/FactoryList.vue'),
      },
      {
        path: 'factories/:factoryCode',
        name: 'FactoryDetail',
        component: () => import('@/pages/base-management/factory/FactoryDetail.vue'),
      },
      {
        path: 'lines',
        name: 'LineList',
        component: () => import('@/pages/base-management/line/LineList.vue'),
      },
      {
        path: 'lines/:lineCode',
        name: 'LineDetail',
        component: () => import('@/pages/base-management/line/LineDetail.vue'),
      },
      {
        path: 'equipments',
        name: 'EquipmentList',
        component: () => import('@/pages/base-management/equipment/EquipmentList.vue'),
      },
      {
        path: 'equipments/:equipmentCode',
        name: 'EquipmentDetail',
        component: () => import('@/pages/base-management/equipment/EquipmentDetail.vue'),
      },
      {
        path: 'processes',
        name: 'ProcessList',
        component: () => import('@/pages/base-management/process/ProcessList.vue'),
      },
      {
        path: 'processes/:processCode',
        name: 'ProcessDetail',
        component: () => import('@/pages/base-management/process/ProcessDetail.vue'),
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
          import('@/pages/production-management/production-plan/ProductionPlanList.vue'),
      },
      {
        path: 'production-plans/:productionPlanId',
        name: 'ProductionPlanDetail',
        component: () =>
          import('@/pages/production-management/production-plan/ProductionPlanDetail.vue'),
      },
      {
        path: 'production-plans/new',
        name: 'CreateProductionPlan',
        component: () =>
          import('@/pages/production-management/production-plan/CreateProductionPlan.vue'),
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
        path: 'defectives/:planDefectiveId',
        name: 'DefectiveDetail',
        component: () => import('@/pages/production-management/defective/DefectiveDetail.vue'),
      },
      {
        path: 'lots',
        name: 'LotList',
        component: () => import('@/pages/production-management/lot/LotList.vue'),
      },
      {
        path: 'lots/:lotId',
        name: 'LotDetail',
        component: () => import('@/pages/production-management/lot/LotDetail.vue'),
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
  // @ts-ignore
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.fullPath.match(/\/{2,}/)) next(to.fullPath.replace(/\/{2,}/g, '/'));

  const authStore = useAuthStore();

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
