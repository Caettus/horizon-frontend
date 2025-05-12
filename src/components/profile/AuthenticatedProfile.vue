<template>
  <v-card elevation="4" class="overflow-hidden profile-card">
    <div class="profile-banner" :style="{ backgroundImage: `url(${user.banner || defaultBanner})` }" />

    <div class="avatar-wrapper">
      <v-avatar size="120" class="elevation-6">
        <img :src="user.avatar || defaultAvatar" :alt="user.username || 'User Avatar'" />
      </v-avatar>
    </div>

    <v-card-text class="text-center pt-6 pb-4">
      <h1 class="text-h5 font-weight-bold mb-1">{{ user.username }}</h1>
      <p class="subtitle-1 grey--text text--darken-1 mb-4">{{ user.email }}</p>
      <v-divider class="my-4" />
      <div class="d-flex justify-space-around align-center my-4">
        <div>
          <p class="subtitle-2 font-weight-medium grey--text text--darken-2 mb-1">Events Created</p>
          <h2 class="text-h5 font-weight-bold primary--text">{{ eventCount }}</h2>
        </div>
        <v-btn icon color="primary" @click="refreshEventCount" :loading="loadingEventCount" title="Refresh event count">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-text>

    <v-divider />

    <v-card-actions class="justify-center pa-4">
      <v-btn color="secondary" rounded @click="$emit('edit-profile')" prepend-icon="mdi-pencil">
        Edit Profile
      </v-btn>
      <v-btn color="primary" rounded @click="navigateToKeycloakAccount" prepend-icon="mdi-account-cog" class="ml-2">
        Manage Account
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import axios from 'axios';

defineProps({
  user: {
    type: Object,
    required: true
  }
});

const keycloak = inject('keycloak');

// --- State ---
const eventCount = ref(0);
const loadingEventCount = ref(false);

// --- Defaults ---
const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg';
const defaultBanner = 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';

// --- Methods ---
async function fetchEventCount() {
  if (!keycloak?.authenticated) return; // Added guard

  loadingEventCount.value = true;
  try {
    // Replace with your actual API endpoint if different
    const response = await axios.get('/api/events/count', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`
      }
    });
    eventCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching event count:', error);
    // Consider emitting an error event or showing a local message
  } finally {
    loadingEventCount.value = false;
  }
}

function refreshEventCount() {
  fetchEventCount();
}

function navigateToKeycloakAccount() {
  if (keycloak && typeof keycloak.accountManagement === 'function') {
    keycloak.accountManagement().catch(err => console.error("Failed to navigate to account management:", err));
  } else {
    console.error("Account management function is not available."); // Changed alert to console.error
  }
}

// --- Lifecycle ---
onMounted(() => {
  fetchEventCount();
});

</script>

<style scoped>
.profile-banner {
  height: 180px;
  background-size: cover;
  background-position: center;
  border-radius: 4px 4px 0 0;
  background-color: #e0e0e0;
}

.avatar-wrapper {
  margin-top: -60px;
  display: flex;
  justify-content: center;
  margin-bottom: -16px;
}

.v-avatar img {
  border: 4px solid white;
  object-fit: cover;
}

.profile-card {
  border-radius: 12px !important;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0.5px;
}

.grey--text.text--darken-1 {
  color: #757575 !important;
}
.grey--text.text--darken-2 {
  color: #616161 !important;
}
.primary--text {
 color: #1976D2 !important; /* Ensure your Vuetify primary color is used */
}
</style>
