<template>
  <v-container class="fill-height auth-page-bg" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="5" xl="4">
        <v-card class="elevation-12 pa-3">
          <v-card-title class="text-h5 font-weight-bold text-center primary--text mb-4">
            Login to Horizon
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            Welcome back! Please login to continue.
          </v-card-subtitle>

          <v-card-text>
            <p class="text-body-1 mb-6 text-center">
              Click the button below to be redirected to our secure login portal.
            </p>
            <v-btn
              color="secondary"
              block
              x-large
              class="mb-4 font-weight-bold"
              @click="handleLogin"
              :loading="loading"
              :disabled="loading"
            >
              <v-icon left>mdi-login-variant</v-icon>
              Login with Horizon
            </v-btn>
          </v-card-text>

          <v-divider class="my-3"></v-divider>

          <v-card-actions class="justify-center">
            <span class="text-body-2">Don't have an account?</span>
            <v-btn
              text
              small
              color="secondary"
              @click="navigateToRegister"
              class="ml-1 text-capitalize font-weight-bold"
            >
              Register Here
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import keycloak from '../keycloak';

const router = useRouter();
const route = useRoute(); // To get query params like 'redirect'
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true
  try {
    const redirect = window.location.origin + (route.query.redirect || '/')
    await keycloak.login({ redirectUri: redirect })
  } catch (e) {
    console.error(e); alert('Could not start login')
    loading.value = false
  }
};

const navigateToRegister = () => {
  router.push({ name: 'Register' });
};

onMounted(() => {
  // If user is already authenticated, redirect them
  if (keycloak && keycloak.authenticated) {
    const redirectTo = route.query.redirect || { name: 'Home' };
    router.push(redirectTo);
  }
});
</script>

<style scoped>
/* Re-use the same styles as RegistrationView or define new ones */
.auth-page-bg {
  background: linear-gradient(to right, #00c6ff 0%, #0072ff 100%); /* Different gradient for login */
  min-height: calc(100vh - 112px); /* Adjust based on your header/footer */
}

.v-card {
  border-radius: 12px !important;
}

.v-card-title {
  /* Assuming secondary color for login, adjust if needed */
  color: #4CAF50; /* Example: Vuetify's default success or your secondary color */
}
.v-btn {
  letter-spacing: 0.5px;
}
</style>
