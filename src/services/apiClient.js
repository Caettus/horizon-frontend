// src/services/apiClient.js
import axios from 'axios';
import keycloak from '../keycloak';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use(
  async (config) => {
    console.log('Interceptor: keycloak.authenticated =', keycloak.authenticated);
    console.log('Interceptor: keycloak.token present =', !!keycloak.token);
    if (keycloak.token) {
      console.log('Interceptor: keycloak.token snippet =', keycloak.token ? keycloak.token.substring(0, 20) + '...' : 'N/A');
    }

    if (keycloak.authenticated && keycloak.token) {
      try {
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          console.log('Token was refreshed by interceptor');
          const authStore = useAuthStore();
          authStore.updateAuthState();
        }
        config.headers.Authorization = `Bearer ${keycloak.token}`;
        console.log('Interceptor: Authorization header SET');
      } catch (error) {
        console.error('Interceptor: Failed to refresh token or user not authenticated during request:', error);
        if (error && error.message) {
          console.error('Interceptor: Error message:', error.message);
        }
        if (error.response && error.response.data) {
          console.error('Interceptor: Error response data:', error.response.data);
        }
        console.error('Interceptor: Keycloak authenticated status at time of error:', keycloak.authenticated);
        console.error('Interceptor: Keycloak token present at time of error:', !!keycloak.token);
        return Promise.reject(error);
      }
    } else {
      console.warn('Interceptor: Authorization header NOT being set. Authenticated:', keycloak.authenticated, ', Token present:', !!keycloak.token);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('Interceptor: Received 401 from API. Token might be invalid or session ended.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
