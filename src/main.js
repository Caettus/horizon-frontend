import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import keycloak, { initKeycloak } from './keycloak';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as baseComponents from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import { useAuthStore } from './stores/auth';

import { VSkeletonLoader } from 'vuetify/components';
const components = {
  ...baseComponents,
  VSkeletonLoader,
};

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        }
      }
    }
  }
});

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);
app.use(router);

app.config.globalProperties.$keycloak = keycloak;
app.provide('keycloak', keycloak);

// main.js (relevant part - should already be similar)
initKeycloak()
  .then(() => { // Receive the status from initKeycloak
    const authStore = useAuthStore(); // Get store instance *after* Pinia is used
    authStore.updateAuthState(); // Sync store with initial KC state
    console.log('Initial auth state synchronized with Pinia store.');

    // Ensure the router is ready before mounting
    router.isReady().then(() => {
      app.mount('#app');
    });
  })
  .catch(err => {
     console.error('Keycloak init failed in main.js:', err);
     // Potentially update store to reflect logged-out state on failure too
     const authStore = useAuthStore();
     authStore.updateAuthState(); // Ensure store shows logged out
     // Still mount the app even if Keycloak fails
     router.isReady().then(() => {
       app.mount('#app');
     });
  });
