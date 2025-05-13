<template>
  <v-card elevation="4" class="overflow-hidden profile-card">
    <div class="profile-banner" :style="{ backgroundImage: `url(${user?.banner || defaultBanner})` }" />

    <div class="avatar-wrapper">
      <v-avatar size="120" class="elevation-6">
        <img :src="user?.avatar || defaultAvatar" :alt="kcProfile?.username || authStore.user?.username || 'User Avatar'" />
      </v-avatar>
    </div>

    <v-card-text class="text-center pt-6 pb-4">
      <!-- Keycloak gebruikersinfo -->
      <h1 class="text-h5 font-weight-bold mb-1">
        {{ kcProfile?.username || kcProfile?.firstName || authStore.user?.username }}
      </h1>
      <p class="subtitle-1 grey--text text--darken-1 mb-2">
        {{ kcProfile?.email || authStore.user?.email }}
      </p>

      <!-- Extra backend profieldata als beschikbaar -->
      <div v-if="profileStore.loading || isLoading">
        <p class="subtitle-2 grey--text text--darken-1">Loading extra profielgegevens...</p>
      </div>
      <!-- Display backend profile data if available (props.user) -->
      <div v-else-if="user && !backendError">
        <p v-if="user.age" class="subtitle-2 grey--text text--darken-1">
          <strong>Leeftijd:</strong> {{ user.age }} jaar
        </p>
        <p v-if="user.dob" class="subtitle-2 grey--text text--darken-1">
          <strong>Geboortedatum:</strong> {{ user.dob }}
        </p>
        <p v-if="user.bio" class="subtitle-2 grey--text text--darken-1">
          <strong>Bio:</strong> {{ user.bio }}
        </p>
        <!-- If there was an error but we still have some user data (e.g. stale), show a note -->
        <p v-if="profileStore.error" class="caption red--text text--darken-1 mt-2">
            Let op: Er was een probleem bij het laden van de meest recente profieldetails.
        </p>
      </div>
      <!-- If no backend data (user is null) AND there was an error fetching it -->
      <div v-else-if="profileStore.error || (backendError && retryCount >= MAX_RETRIES)">
        <p class="subtitle-2 red--text text--darken-1">Oeps! Extra profielgegevens konden niet worden geladen.</p>
        <p v-if="backendError && retryCount >= MAX_RETRIES" style="color: red;">
          Could not connect to the server. Some features may be unavailable.
        </p>
      </div>
      <!-- If no backend data, not loading, and no error (e.g., new user, profile not yet created) -->
      <div v-else>
        <p class="subtitle-2 grey--text text--darken-1">Geen aanvullende profielinformatie ingesteld.</p>
        <p class="caption grey--text text--darken-1">Je kunt je profiel aanvullen via "Edit Profile".</p>
      </div>

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
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';

defineProps({
  user: {
    type: Object,
    required: false,
    default: () => null
  }
});

const keycloak = inject('keycloak');
const authStore = useAuthStore();
const profileStore = useProfileStore();

// --- State ---
const eventCount = ref(null); // Initialize to null or appropriate default
const loadingEventCount = ref(false);
const kcProfile = ref(null);
const profileData = ref(null);
const isLoading = ref(true);
const initialLoadAttempted = ref(false); // To know if the initial load process has run

// State for profile fetching
const profileErrorOccurred = ref(false);
const profileMaxRetriesReached = ref(false);

// State for event count fetching
const eventCountErrorOccurred = ref(false);
const eventCountMaxRetriesReached = ref(false);

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 2000; // Base delay for retries

// --- Defaults ---
const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg';
const defaultBanner = 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';

// --- Helper function ---
async function createFetcher(url, dataRef, errorOccurredRef, maxRetriesReachedRef, successCallback) {
  let attempts = 0;
  maxRetriesReachedRef.value = false; // Reset on new fetch sequence
  errorOccurredRef.value = false;

  return new Promise((resolve) => {
    async function tryFetch() {
      try {
        const response = await axios.get(url);
        if (successCallback) {
          successCallback(response.data);
        } else {
          dataRef.value = response.data;
        }
        errorOccurredRef.value = false;
        maxRetriesReachedRef.value = false;
        resolve({ success: true });
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        errorOccurredRef.value = true;
        attempts++;
        if (attempts >= MAX_RETRIES) {
          maxRetriesReachedRef.value = true;
          console.error(`Max retries reached for ${url}.`);
          resolve({ success: false });
        } else {
          setTimeout(tryFetch, RETRY_DELAY_BASE_MS * attempts);
        }
      }
    }
    tryFetch();
  });
}

// --- Methods ---
function refreshEventCount() {
  createFetcher(
    '/api/events/count',
    eventCount,
    eventCountErrorOccurred,
    eventCountMaxRetriesReached,
    (data) => { eventCount.value = data.count; }
  );
}

function navigateToKeycloakAccount() {
  if (keycloak && typeof keycloak.accountManagement === 'function') {
    keycloak.accountManagement().catch(err => console.error("Failed to navigate to account management:", err));
  } else {
    console.error("Account management function is not available.");
  }
}

// --- Lifecycle ---
onMounted(async () => {
  console.log('AuthenticatedProfile.vue mounted. Initializing data fetch.');

  isLoading.value = true;
  initialLoadAttempted.value = false;

  // Reset states on mount to allow fresh attempts if component re-mounts
  profileMaxRetriesReached.value = false;
  profileErrorOccurred.value = false;
  eventCountMaxRetriesReached.value = false;
  eventCountErrorOccurred.value = false;

  const profileFetcherPromise = createFetcher(
    '/api/profile',
    profileData,
    profileErrorOccurred,
    profileMaxRetriesReached,
    (data) => { profileData.value = data; }
  );

  const eventCountFetcherPromise = createFetcher(
    '/api/events/count',
    eventCount,
    eventCountErrorOccurred,
    eventCountMaxRetriesReached,
    (data) => { eventCount.value = data.count; }
  );

  await Promise.allSettled([profileFetcherPromise, eventCountFetcherPromise]);

  isLoading.value = false;
  initialLoadAttempted.value = true;
  console.log('Initial data fetch sequence complete (succeeded or max retries).');
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
  color: #1976D2 !important;
}
</style>
