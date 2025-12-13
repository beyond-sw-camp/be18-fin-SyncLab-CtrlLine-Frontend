import { defineStore } from 'pinia';

import { baseManagement, productionManagement, productionReport } from '@/constants/category';

export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: () => ({
    list: [],
  }),

  actions: {
    setBreadcrumbByPath(path) {
      const normalizedPath = normalizeDynamicPath(path);

      const allGroups = [
        { label: '기초 관리', children: baseManagement },
        { label: '생산 관리', children: productionManagement },
        { label: '출력물', children: productionReport },
      ];

      const result = findTrailRecursive(allGroups, normalizedPath);
      this.list = result;
    },
  },
});

/**
 * 재귀 탐색 함수
 * @param {Array} nodes - 메뉴 트리 배열
 * @param {String} targetPath - 현재 route.path
 * @param {Array} trail - 현재까지의 breadcrumb 누적
 * @returns {Array} breadcrumb 경로 배열
 */
function findTrailRecursive(nodes, targetPath, trail = []) {
  for (const node of nodes) {
    const currentTrail = [...trail, { label: node.label, to: node.to }];

    // 현재 노드가 해당 경로면 trail 반환
    if (node.to === targetPath) {
      return currentTrail;
    }

    // 자식 노드가 있으면 재귀 탐색
    if (node.children) {
      const found = findTrailRecursive(node.children, targetPath, currentTrail);
      if (found.length) return found;
    }
  }
  return [];
}

/**
 * 동적 path를 패턴 형태로 정규화
 * 예: '/base-management/users/17' -> '/base-management/users/:userId'
 */
export function normalizeDynamicPath(path) {
  const allGroups = [
    ...flattenMenus(baseManagement),
    ...flattenMenus(productionManagement),
    ...flattenMenus(productionReport),
  ];

  // 정확히 일치하는 경우 (정적 경로)
  const exactMatch = allGroups.find(item => item.to === path);
  if (exactMatch) return path;

  // 동적 매칭 시도
  for (const { to } of allGroups) {
    if (!to.includes(':')) continue;

    // '/base-management/users/:userId' → /^\/base-management\/users\/[^/]+$/
    const pattern = new RegExp('^' + to.replace(/:[^/]+/g, '[^/]+') + '$');
    if (pattern.test(path)) {
      return to; // '/base-management/users/:userId' 반환
    }
  }

  // 매칭 실패 시 원본 반환
  return path;
}

/**
 * 메뉴 트리를 1차원 배열로 평탄화
 * 각 항목은 { label, to } 형태
 */
function flattenMenus(nodes, acc = []) {
  for (const node of nodes) {
    if (node.to) {
      acc.push({ label: node.label, to: node.to });
    }
    if (node.children) {
      flattenMenus(node.children, acc);
    }
  }
  return acc;
}
