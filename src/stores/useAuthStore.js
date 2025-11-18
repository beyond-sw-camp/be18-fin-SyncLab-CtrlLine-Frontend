import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
  }),

  getters: {
    isLoggedIn: state => !!state.accessToken,
  },

  actions: {
    setToken(token) {
      this.accessToken = token;
      localStorage.setItem('access_token', token);
    },
    clearAuth() {
      this.accessToken = null;
      localStorage.removeItem('access_token');
    },
  },
});
