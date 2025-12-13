import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    openGroupKeys: new Set(),
    openSubKeys: new Set(),

    pinnedGroupKeys: new Set(),
    pinnedSubKeys: new Set(),

    lastTopKey: null,
  }),

  actions: {
    toggleGroupOpen(key) {
      this.openGroupKeys.has(key) ? this.openGroupKeys.delete(key) : this.openGroupKeys.add(key);
    },

    toggleSubOpen(key) {
      this.openSubKeys.has(key) ? this.openSubKeys.delete(key) : this.openSubKeys.add(key);
    },

    toggleGroupPin(key) {
      this.pinnedGroupKeys.has(key)
        ? this.pinnedGroupKeys.delete(key)
        : this.pinnedGroupKeys.add(key);
    },

    toggleSubPin(key) {
      this.pinnedSubKeys.has(key) ? this.pinnedSubKeys.delete(key) : this.pinnedSubKeys.add(key);
    },

    resetAll() {
      this.openGroupKeys.clear();
      this.openSubKeys.clear();
      this.pinnedGroupKeys.clear();
      this.pinnedSubKeys.clear();
    },

    syncRoute(topKey) {
      // 최초 진입
      if (this.lastTopKey === null) {
        this.lastTopKey = topKey;
        this.openGroupKeys.add(topKey);
        return;
      }

      // 최상위 디렉토리 변경
      if (topKey && topKey !== this.lastTopKey) {
        this.resetAll();
        this.openGroupKeys.add(topKey);
      }

      this.lastTopKey = topKey;
    },
  },
});
