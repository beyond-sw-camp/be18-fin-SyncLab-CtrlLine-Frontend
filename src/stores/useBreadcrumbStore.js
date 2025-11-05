import { defineStore } from 'pinia';

import { baseManagement, productionManagement, productionReport } from '@/constants/category';

export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: () => ({
    list: [],
  }),

  actions: {
    setBreadcrumbByPath(path) {
      const allGroups = [
        { label: '기초 관리', children: baseManagement },
        { label: '생산계획 관리', children: productionManagement },
        { label: '출력물', children: productionReport },
      ];

      const result = findTrailRecursive(allGroups, path);
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
