<template>
  <v-card elevation="4" class="text-center pa-8 guest-card">
    <v-icon size="80" color="primary" class="mb-6">mdi-account-lock-outline</v-icon>
    <h2 class="text-h5 font-weight-bold mb-3">Your Profile Awaits!</h2>
    <p class="subtitle-1 grey--text text--darken-1 mb-8">
      Please log in or create an account to view and manage your profile,
      track your events, and connect with the Horizon community.
    </p>
    <v-row>
      <v-col cols="12" sm="6">
        <v-btn color="primary" block large rounded @click="$emit('login')" prepend-icon="mdi-login-variant">
          Login
        </v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn color="secondary" block large rounded @click="$emit('register')" prepend-icon="mdi-account-plus-outline">
          Register
        </v-btn>
      </v-col>
    </v-row>
    <p class="text-caption grey--text mt-8">
      Joining is quick and opens up a world of possibilities!
    </p>
  </v-card>
</template>

<script setup>
defineEmits(['login', 'register']);
</script>

<style scoped>
.guest-card {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.9);
}

.v-btn {
  text-transform: none;
  letter-spacing: 0.5px;
}

.grey--text.text--darken-1 {
  color: #757575 !important;
}
.grey--text {
  color: #9E9E9E !important; /* Added for caption */
}
</style>
