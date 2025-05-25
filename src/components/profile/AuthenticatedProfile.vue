<template>
  <v-card elevation="4" class="overflow-hidden profile-card">
    <div class="profile-banner" :style="{ backgroundImage: `url(${profileStore.profileData?.banner || defaultBanner})` }" />

    <div class="avatar-wrapper">
      <v-avatar size="120" class="elevation-6">
        <img :src="profileStore.profileData?.avatar || defaultAvatar" :alt="kcProfile?.username || authStore.user?.username || 'User Avatar'" />
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

      <!-- Loading state for profile from store -->
      <div v-if="profileStore.loading && !initialLoadAttempted"> <!-- Show only initial profile loading -->
        <p class="subtitle-2 grey--text text--darken-1">Loading extra profielgegevens...</p>
      </div>

      <!-- Display backend profile data if available from store -->
      <div v-else-if="profileStore.profileData && !profileStore.error">
        <p v-if="profileStore.profileData.age" class="subtitle-2 grey--text text--darken-1">
          <strong>Leeftijd:</strong> {{ profileStore.profileData.age }} jaar
        </p>
        <p v-if="profileStore.profileData.dob" class="subtitle-2 grey--text text--darken-1">
          <strong>Geboortedatum:</strong> {{ profileStore.profileData.dob }}
        </p>
        <p v-if="profileStore.profileData.bio" class="subtitle-2 grey--text text--darken-1">
          <strong>Bio:</strong> {{ profileStore.profileData.bio }}
        </p>
        <!-- If there was an error but we still have some user data (e.g. stale), show a note -->
        <p v-if="profileStore.error && profileStore.profileData" class="caption red--text text--darken-1 mt-2">
            Let op: Er was een probleem bij het laden van de meest recente profieldetails. De getoonde data kan verouderd zijn.
        </p>
      </div>

      <!-- If profile store has an error and no profile data -->
      <div v-else-if="profileStore.error && !profileStore.profileData">
        <p class="subtitle-2 red--text text--darken-1">Oeps! Extra profielgegevens konden niet worden geladen.</p>
      </div>

      <!-- If no backend data, not loading, and no error (e.g., new user, profile not yet created) -->
      <div v-else-if="!profileStore.profileData && !profileStore.loading && !profileStore.error && initialLoadAttempted">
        <p class="subtitle-2 grey--text text--darken-1">Geen aanvullende profielinformatie ingesteld.</p>
        <p class="caption grey--text text--darken-1">Je kunt je profiel aanvullen via "Edit Profile".</p>
      </div>

      <v-divider class="my-4" />

      <div class="d-flex justify-space-around align-center my-4">
        <div>
          <p class="subtitle-2 font-weight-medium grey--text text--darken-2 mb-1">Events Created</p>
          <h2 v-if="eventCount !== null && !eventCountErrorOccurred" class="text-h5 font-weight-bold primary--text">{{ eventCount }}</h2>
          <p v-else-if="loadingEventCount" class="subtitle-2 grey--text text--darken-1">Loading count...</p>
          <p v-else-if="eventCountErrorOccurred && eventCountMaxRetriesReached" class="subtitle-2 red--text text--darken-1">Kon aantal niet laden.</p>
          <p v-else-if="eventCountErrorOccurred" class="subtitle-2 red--text text--darken-1">Fout bij laden telling.</p>
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
import { ref, onMounted, inject, watch } from 'vue';
import apiClient from '@/services/apiClient';
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
const eventCount = ref(null);
const loadingEventCount = ref(false);
const kcProfile = ref(null);
const isLoading = ref(true);
const initialLoadAttempted = ref(false);

// State for event count fetching
const eventCountErrorOccurred = ref(false);
const eventCountMaxRetriesReached = ref(false);

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 2000;

// --- Defaults ---
const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg';
const defaultBanner = 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';

// --- Helper function for event count ---
async function fetchEventCountWithRetries() {
  let attempts = 0;
  loadingEventCount.value = true;
  eventCountMaxRetriesReached.value = false;
  eventCountErrorOccurred.value = false;

  return new Promise((resolve) => {
    async function tryFetch() {
      try {
        // Gebruik apiClient voor de request
        const response = await apiClient.get('/internal/eventbus/userservice/event-count');
        eventCount.value = response.data.count;
        eventCountErrorOccurred.value = false;
        eventCountMaxRetriesReached.value = false;
        resolve({ success: true });
      } catch (error) {
        console.error(`Error fetching event count:`, error);
        eventCountErrorOccurred.value = true;
        attempts++;
        if (attempts >= MAX_RETRIES) {
          eventCountMaxRetriesReached.value = true;
          console.error(`Max retries reached for event count.`);
          resolve({ success: false });
        } else {
          setTimeout(tryFetch, RETRY_DELAY_BASE_MS * attempts);
        }
      } finally {
        if (attempts >= MAX_RETRIES || !eventCountErrorOccurred.value) {
          loadingEventCount.value = false;
        }
      }
    }
    tryFetch();
  });
}

// --- Methods ---
function refreshEventCount() {
  fetchEventCountWithRetries();
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
  // isLoading.value = true; // Managed by watchers now or at specific points
  initialLoadAttempted.value = false;

  // Reset states on mount
  eventCountMaxRetriesReached.value = false;
  eventCountErrorOccurred.value = false;
  loadingEventCount.value = true; // Start loading event count immediately

  // Fetch Keycloak profile if not already loaded by authStore or elsewhere
  if (keycloak && keycloak.authenticated && !kcProfile.value) {
    try {
      const keycloakProfileData = await keycloak.loadUserProfile();
      kcProfile.value = keycloakProfileData;
      if (!authStore.user?.email && keycloakProfileData.email) {
        authStore.setUser(keycloakProfileData);
      }
    } catch (error) {
      console.error("Failed to load Keycloak user profile:", error);
    }
  }

  // Start fetching backend profile data using the store if not already available/loading
  let profilePromise = Promise.resolve();
  if (!profileStore.hasProfile && !profileStore.loading) {
    console.log('AuthenticatedProfile: Triggering profileStore.fetchProfile()');
    profilePromise = profileStore.fetchProfile(); // No await here, let it run in background
  } else if (profileStore.hasProfile) {
    console.log('AuthenticatedProfile: Profile data already in store or being loaded.');
  }

  const eventCountFetcherPromise = fetchEventCountWithRetries();

  await Promise.allSettled([profilePromise, eventCountFetcherPromise]);

  initialLoadAttempted.value = true;
  // isLoading.value will be managed by watchers based on profileStore.loading and loadingEventCount
  console.log('AuthenticatedProfile: Initial data fetch sequence (profile store & event count) initiated.');
});

watch(
  () => profileStore.loading,
  (newLoadingState) => {
    // If profile store starts loading, the main page isLoading should reflect that.
    // If profile store finishes loading, and event count is also not loading, then main page is not loading.
    if (newLoadingState) {
      isLoading.value = true;
    } else if (!loadingEventCount.value) {
      isLoading.value = false;
    }
  }
);

watch(
  loadingEventCount,
  (newEventCountLoading) => {
    // If event count starts loading, the main page isLoading should reflect that.
    // If event count finishes loading, and profile store is also not loading, then main page is not loading.
    if (newEventCountLoading) {
      isLoading.value = true;
    } else if (!profileStore.loading) {
      isLoading.value = false;
    }
  }
);

// Ensure isLoading is false if both are done loading when the component mounts and data is already present
if (!profileStore.loading && !loadingEventCount.value) {
    isLoading.value = false;
}

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
