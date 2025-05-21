// src/services/apiClient.js
import axios from 'axios';
import keycloak from '../keycloak'; // Your initialized Keycloak instance
import { useAuthStore } from '@/stores/auth'; // Use Pinia store

const apiClient = axios.create({
  baseURL: '/api', // All your API calls go through the Vite proxy at /api
});

apiClient.interceptors.request.use(
  async (config) => {
    // --- Start of added console logs ---
    console.log('Interceptor: keycloak.authenticated =', keycloak.authenticated);
    console.log('Interceptor: keycloak.token present =', !!keycloak.token);
    if (keycloak.token) {
      // For debugging, you might want to see a snippet or decoded version in a real scenario,
      // but logging the raw token directly in the console can be a security risk if others see it.
      // For now, just confirming presence or a small part can be enough.
      console.log('Interceptor: keycloak.token snippet =', keycloak.token ? keycloak.token.substring(0, 20) + '...' : 'N/A');
    }
    // --- End of added console logs ---

    if (keycloak.authenticated && keycloak.token) {
      try {
        const refreshed = await keycloak.updateToken(30); // Update if <30s validity or expired
        if (refreshed) {
          console.log('Token was refreshed by interceptor');
          const authStore = useAuthStore(); // Get store instance to update it
          authStore.updateAuthState(); // Re-sync store with new token details
        }
        config.headers.Authorization = `Bearer ${keycloak.token}`;
        console.log('Interceptor: Authorization header SET'); // Confirm header is set
      } catch (error) {
        console.error('Interceptor: Failed to refresh token or user not authenticated during request:', error);
        // It's often better not to automatically redirect to login from an interceptor
        // as it can interrupt background tasks or non-critical API calls.
        // Let the calling code or a global error handler decide.
        // Example: keycloak.login();
        return Promise.reject(error); // Error during refresh, token not attached
      }
    } else {
      // --- Added console log for when the header is NOT set ---
      console.warn('Interceptor: Authorization header NOT being set. Authenticated:', keycloak.authenticated, ', Token present:', !!keycloak.token);
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
      console.warn('Interceptor: Received 401 from API. Token might be invalid or session ended.');
      // It might be wise to clear local auth state and prompt for login
      // const authStore = useAuthStore();
      // authStore.logout(); // This will redirect to Keycloak logout then home
      // Or just: keycloak.login();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
