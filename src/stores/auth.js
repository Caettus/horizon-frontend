import { defineStore } from 'pinia';
import keycloak from '../keycloak';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    token: null,
    tokenParsed: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
  },

  actions: {
    updateAuthState() {
      this.isAuthenticated = keycloak.authenticated;
      if (keycloak.tokenParsed) {
        this.token = keycloak.token;
        this.tokenParsed = keycloak.tokenParsed;
        this.user = {
          id: keycloak.tokenParsed.sub,
          username: keycloak.tokenParsed.preferred_username || keycloak.tokenParsed.name,
          email: keycloak.tokenParsed.email,
        };
      } else {
        this.token = null;
        this.tokenParsed = null;
        this.user = null;
      }
    },

    async login() {
      try {
        await keycloak.login();
        this.updateAuthState();
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    async logout() {
      try {
        await keycloak.logout({ redirectUri: window.location.origin });
        this.updateAuthState();
      } catch (error) {
        console.error('Logout failed:', error);
        throw error;
      }
    },

    async register() {
      try {
        await keycloak.register();
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
  },
});
