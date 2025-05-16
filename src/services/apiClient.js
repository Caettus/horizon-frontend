// src/services/apiClient.js
import axios from 'axios';
import keycloak from '../keycloak'; // Your initialized Keycloak instance
import { useAuthStore } from '@/stores/auth'; // Use Pinia store

const apiClient = axios.create({
  baseURL: '/api', // All your API calls go through the Vite proxy at /api
});

apiClient.interceptors.request.use(
  async (config) => {
    // No need to get authStore here if using keycloak directly
    if (keycloak.authenticated && keycloak.token) {
      try {
        // Refresh token if it's about to expire (e.g., within 30 seconds)
        // keycloak.isTokenExpired(minValidity) can be used
        // keycloak.onTokenExpired in keycloak.js already tries to refresh
        // but an explicit check here can be good too.
        const refreshed = await keycloak.updateToken(30); // Update if <30s validity or expired
        if (refreshed) {
          console.log('Token was refreshed by interceptor');
          const authStore = useAuthStore(); // Get store instance to update it
          authStore.updateAuthState(); // Re-sync store with new token details
        }
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error('Failed to refresh token or user not authenticated during request:', error);
        // It's often better not to automatically redirect to login from an interceptor
        // as it can interrupt background tasks or non-critical API calls.
        // Let the calling code or a global error handler decide.
        // Example: keycloak.login();
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling (e.g., 401s)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, it could mean the token is truly invalid or session expired
      console.warn('Received 401 from API. Token might be invalid or session ended.');
      // It might be wise to clear local auth state and prompt for login
      // const authStore = useAuthStore();
      // authStore.logout(); // This will redirect to Keycloak logout then home
      // Or just: keycloak.login();
    }
    return Promise.reject(error);
  }
);

export default apiClient;