import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; // Import router
import keycloak, { initKeycloak } from './keycloak'; // Your keycloak.js
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Import MDI for icons

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // Ensure MDI icons are available
  },
  theme: { // Optional: Define a basic theme
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2', // Blue
          secondary: '#424242', // Dark Grey
          accent: '#82B1FF',   // Light Blue
          error: '#FF5252',    // Red
          info: '#2196F3',     // Light Blue
          success: '#4CAF50',  // Green
          warning: '#FB8C00',  // Orange
        }
      }
    }
  }
});

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);

// Provide Keycloak globally AFTER it's initialized,
// or ensure components handle its potential unavailability gracefully during init.
// Your current approach of providing it before init is fine, components should check.
app.config.globalProperties.$keycloak = keycloak;
app.provide('keycloak', keycloak);

initKeycloak()
  .then(() => { // kcInstance is the same `keycloak` you imported and made global
    console.log('Keycloak Initialized. Authenticated:', keycloak.authenticated);
    if (keycloak.token) {
      console.log('Token:', keycloak.token);
      // console.log('Keycloak Token Parsed:', keycloak.tokenParsed); // Parsed token
    }

    // Now that Keycloak is initialized, and we know the auth state,
    // we can safely use the router.
    app.use(router);

    router.isReady().then(() => { // Ensure router is fully ready
      app.mount('#app');
    });
  })
  .catch(err => {
    console.error('Keycloak init failed:', err);
    // Fallback: Mount the app but Keycloak features won't work.
    // You might want to display an error message to the user.
    // Or, you could have a minimal version of the app that doesn't rely on Keycloak.
    // For now, we'll still use the router to allow navigation to public error pages if any.
    app.use(router);
    router.isReady().then(() => {
      app.mount('#app');
      // Optionally, redirect to an error page:
      // router.push({ name: 'ErrorKeycloakInit' });
    });
  });
