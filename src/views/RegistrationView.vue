<template>
  <v-container class="fill-height auth-page-bg" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="5" xl="4">
        <v-card class="elevation-12 pa-3">
          <v-card-title class="text-h5 font-weight-bold text-center primary--text mb-4">
            Create Your Horizon Account
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            Join our community to unlock exclusive features and content.
          </v-card-subtitle>

          <v-card-text>
            <p class="text-body-1 mb-6 text-center">
              By clicking "Register with Horizon", you will be redirected to our secure
              registration portal to create your account.
            </p>
            <v-btn
              color="primary"
              block
              x-large
              class="mb-4 font-weight-bold"
              @click="handleRegistration"
              :loading="loading"
              :disabled="loading"
            >
              <v-icon left>mdi-account-plus</v-icon>
              Register with Horizon
            </v-btn>
          </v-card-text>

          <v-divider class="my-3"></v-divider>

          <v-card-actions class="justify-center">
            <span class="text-body-2">Already have an account?</span>
            <v-btn
              text
              small
              color="primary"
              @click="navigateToLogin"
              class="ml-1 text-capitalize font-weight-bold"
            >
              Login Here
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const keycloak = inject('keycloak');
const router = useRouter();
const loading = ref(false);

const handleRegistration = async () => {
  if (!keycloak) {
    console.error('Keycloak instance not available.');
    // Optionally, show an error to the user via a snackbar or alert
    alert('Registration service is currently unavailable. Please check your connection or try again later.');
    return;
  }

  loading.value = true;
  try {
    // The register() method redirects the user to the Keycloak registration page.
    // It doesn't return a promise that resolves upon successful registration in the same browser context immediately,
    // as the redirection takes the user away from your app.
    // Post-registration, Keycloak will redirect back to your app's configured redirectUri.
    await keycloak.register();
    // The line above will cause a redirect, so code below it might not execute if redirect happens.
    // If $keycloak.register() itself could fail before redirect (e.g., misconfiguration detectable client-side),
    // the catch block would handle it.
  } catch (error) {
    console.error('Error initiating Keycloak registration:', error);
    alert('Could not redirect to registration. Please try again.');
    loading.value = false;
  }
  // No need to set loading.value = false here if redirect is successful.
};

const navigateToLogin = () => {
  router.push({ name: 'Login' }); // Assuming you have a 'Login' route
};

onMounted(() => {
  // If user is already authenticated, redirect them away from registration page
  if (keycloak && keycloak.authenticated) {
    router.push({ name: 'Home' }); // Or your main authenticated route
  }
});
</script>

<style scoped>
.auth-page-bg {
  /* You can set a background image or gradient here */
  background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
  min-height: calc(100vh - 112px); /* Adjust 112px based on your header and footer combined height */
}

.v-card {
  border-radius: 12px !important;
}

.v-card-title {
  color: #1976D2; /* Vuetify's default primary, adjust if your theme is different */
}

.v-btn {
  letter-spacing: 0.5px;
}
</style>
