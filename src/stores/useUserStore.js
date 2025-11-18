import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    empNo: null,
    userName: null,
    userRole: null,
    userEmail: null,
  }),

  actions: {
    setUser(user) {
      this.id = user.id;
      this.empNo = user.empNo;
      this.userName = user.userName;
      this.userRole = user.userRole;
      this.userEmail = user.userEmail;
    },
    clearUser() {
      this.id = null;
      this.empNo = null;
      this.userName = null;
      this.userRole = null;
      this.userEmail = null;
    },
  },
  persist: true,
});
