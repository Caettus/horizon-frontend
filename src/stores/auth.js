import { defineStore } from 'pinia';
import keycloak from '../keycloak';
import apiClient from '@/services/apiClient';

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

        if (this.isAuthenticated && this.user && !sessionStorage.getItem('userSyncAttempted')) {
          const { id: keycloakId, username, email } = this.user;
          const syncPayload = { keycloakId, username, email };
          apiClient.post('/users/internal/synchronize', syncPayload)
            .then(() => {
              console.log('User synchronization successful from updateAuthState.');
              sessionStorage.setItem('userSyncAttempted', 'true');
            })
            .catch(syncError => {
              console.error('User synchronization failed from updateAuthState:', syncError.response?.data || syncError.message);
              sessionStorage.setItem('userSyncAttempted', 'true');
            });
        }
      } else {
        this.token = null;
        this.tokenParsed = null;
        this.user = null;
        sessionStorage.removeItem('userSyncAttempted');
      }
    },

    async login() {
      try {
        await keycloak.login();
        this.updateAuthState();

        if (this.isLoggedIn && this.user) {
          const { id: keycloakId, username, email } = this.user;
          const syncPayload = { keycloakId, username, email };
          try {
            if (!sessionStorage.getItem('userSyncAttempted')) {
              await apiClient.post('/users/internal/synchronize', syncPayload);
              console.log('User synchronization successful after login.');
              sessionStorage.setItem('userSyncAttempted', 'true');
            }
          } catch (syncError) {
            console.error('User synchronization failed after login:', syncError.response?.data || syncError.message);
            if (!sessionStorage.getItem('userSyncAttempted')) {
                sessionStorage.setItem('userSyncAttempted', 'true');
            }
          }
        }
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
