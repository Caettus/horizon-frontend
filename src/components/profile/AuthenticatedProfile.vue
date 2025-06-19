<template>
  <v-card v-if="!isLoading && profileStore.profileData" elevation="6" class="profile-card mx-auto" max-width="600">
    <div
      class="profile-banner"
      :style="{ backgroundImage: `url(${profileStore.profileData.bannerUrl || defaultBanner})` }"
    ></div>

    <v-card-text class="text-center">
      <div class="avatar-wrapper">
        <v-avatar size="120" class="elevation-6">
          <img :src="profileStore.profileData.avatarUrl || defaultAvatar" alt="User Avatar">
        </v-avatar>
      </div>

      <h1 class="text-h5 font-weight-bold mt-4 mb-1">{{ profileStore.profileData.username || 'N/A' }}</h1>
      <p class="subtitle-1 grey--text text--darken-1 mb-4">{{ profileStore.profileData.email || 'No email provided' }}</p>

      <v-divider class="my-4" />

      <!-- Section for Event Count -->
      <div class="d-flex justify-space-around align-center my-4">
        <div>
          <p class="subtitle-2 font-weight-medium grey--text text--darken-2 mb-1">Events Created</p>
          <!-- Display eventsCreated from profileStore.profileData -->
          <h2 v-if="profileStore.profileData && profileStore.profileData.eventsCreated !== undefined" class="text-h5 font-weight-bold primary--text">
            {{ profileStore.profileData.eventsCreated }}
          </h2>
          <!-- Show loading or N/A if eventsCreated is not available -->
          <p v-else-if="profileStore.loading" class="subtitle-2 grey--text text--darken-1">Loading count...</p>
          <p v-else class="subtitle-2 grey--text text--darken-1">N/A</p>
        </div>
        <!-- Removed refresh button as count comes with profile data -->
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

  <!-- My RSVPs Section -->
  <v-card v-if="!isLoading && profileStore.profileData" elevation="6" class="profile-card mx-auto mt-6" max-width="600">
    <v-card-title class="text-h6 font-weight-bold">My Upcoming Events</v-card-title>
    <v-divider />
    <v-card-text>
      <div v-if="isLoadingRsvps" class="text-center pa-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-2">Loading your events...</p>
      </div>
      <div v-else-if="rsvpsError" class="text-error pa-2">
        <p>Could not load your events: {{ rsvpsError }}</p>
      </div>
      <div v-else-if="rsvpedEvents.length > 0">
        <v-row dense>
          <v-col v-for="event in rsvpedEvents" :key="event.id" cols="12" sm="6">
            <EventCard :event="event" @click="showEventDetails(event)" class="ma-2"/>
          </v-col>
        </v-row>
      </div>
      <div v-else class="text-center pa-4">
        <p>You have not RSVP'd to any events yet.</p>
      </div>
    </v-card-text>
  </v-card>

  <EventDetailsModal
    :model-value="isModalVisible"
    :event="selectedEvent"
    @update:model-value="isModalVisible = false"
  />
</template>

<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import RsvpService from '@/services/rsvpService';
import apiClient from '@/services/apiClient';
import EventCard from '@/components/EventCard.vue';
import EventDetailsModal from '@/components/EventDetailsModal.vue';

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
const kcProfile = ref(null);
const isLoading = ref(true);
const initialLoadAttempted = ref(false);
const rsvpedEvents = ref([]);
const isLoadingRsvps = ref(false);
const rsvpsError = ref(null);
const selectedEvent = ref(null);
const isModalVisible = ref(false);

// --- Defaults ---
const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg';
const defaultBanner = 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';

// --- Methods ---
function navigateToKeycloakAccount() {
  if (keycloak && typeof keycloak.accountManagement === 'function') {
    keycloak.accountManagement().catch(err => console.error("Failed to navigate to account management:", err));
  } else {
    console.error("Account management function is not available.");
  }
}

function showEventDetails(event) {
  selectedEvent.value = event;
  isModalVisible.value = true;
}

async function fetchRsvpedEvents() {
  if (!authStore.user?.id) {
    rsvpsError.value = 'User not found.';
    return;
  }

  isLoadingRsvps.value = true;
  rsvpsError.value = null;

  try {
    const rsvpResponse = await RsvpService.getRsvpsByUserId(authStore.user.id);
    const rsvps = rsvpResponse.data;

    if (!rsvps || rsvps.length === 0) {
      rsvpedEvents.value = [];
      return;
    }

    const eventIds = rsvps.map(rsvp => rsvp.eventId).filter(id => id);
    if (eventIds.length === 0) {
      rsvpedEvents.value = [];
      return;
    }

    const eventsResponse = await apiClient.get(`/events/batch?ids=${eventIds.join(',')}`);
    rsvpedEvents.value = eventsResponse.data;

  } catch (err) {
    console.error('Failed to fetch RSVP\'d events:', err);
    rsvpsError.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
  } finally {
    isLoadingRsvps.value = false;
  }
}

// --- Lifecycle ---
onMounted(async () => {
  console.log('AuthenticatedProfile.vue mounted. Initializing data fetch.');
  initialLoadAttempted.value = false;

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

  fetchRsvpedEvents();

  await Promise.allSettled([profilePromise]);

  initialLoadAttempted.value = true;
  // isLoading.value will be managed by watchers based on profileStore.loading
  console.log('AuthenticatedProfile: Initial data fetch sequence (profile store) initiated.');
});

watch(
  () => profileStore.loading,
  (newLoadingState) => {
    // isLoading now directly reflects profileStore.loading
    isLoading.value = newLoadingState;
  }
);

// Ensure isLoading is false if profile is done loading when component mounts
if (!profileStore.loading) {
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
