<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="7">
        <!-- 1) Niet ingelogd -->
        <GuestProfile
          v-if="!authStore.isLoggedIn"
          @login="handleLogin"
          @register="handleRegister"
        />

        <!-- 2) Ingelogd -->
        <template v-else>
          <!-- A) Laden van backend profiel (via profileStore) -->
          <v-skeleton-loader
            v-if="profileStore.loading"
            type="card-avatar, article, actions"
          />
          <!-- B) Laden voltooid: Toon foutmelding, AuthenticatedProfile of "Maak Profiel Aan" bericht -->
          <template v-else>
            <!-- Toon foutmelding als er een error is -->
            <v-card v-if="profileStore.error" class="pa-4 text-center">
              <v-card-title class="text-error">Error</v-card-title>
              <v-card-text>
                We couldn't load your profile. Please try again later.
              </v-card-text>
            </v-card>

            <!-- Toon AuthenticatedProfile als er een backend profiel is -->
            <AuthenticatedProfile
              v-else-if="profileStore.hasProfile"
              :user="profileStore.profileData"
              @edit-profile="openEditDialog"
            />

            <!-- Toon "Maak Profiel Aan" als ingelogd, niet ladend, geen error, en geen profiel -->
            <div v-else>
              <v-card class="pa-4 text-center">
                <v-card-title>Welcome!</v-card-title>
                <v-card-text>
                  Your profile isn't set up yet.
                  <br>
                  <v-btn color="primary" @click="openEditDialog" class="mt-4">Create Profile</v-btn>
                </v-card-text>
              </v-card>
            </div>
          </template>
        </template>
      </v-col>
    </v-row>

    <!-- Edit Dialog blijft beschikbaar zodra je ingelogd bent -->
    <!-- De 'user' prop hier kan nog steeds null zijn als profileStore.profileData null is. -->
    <!-- EditProfileDialog.vue moet hier mogelijk ook robuuster mee omgaan. -->
    <EditProfileDialog
      v-if="authStore.isLoggedIn"
      v-model="editDialogVisible"
      :user="profileStore.profileData"
      @profile-saved="handleProfileUpdate"
      @profile-save-error="handleProfileSaveError"
    />

    <!-- Snackbar for feedback -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      top
      right
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn text @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import AuthenticatedProfile from '@/components/profile/AuthenticatedProfile.vue';
import GuestProfile from '@/components/profile/GuestProfile.vue';
import EditProfileDialog from '@/components/profile/EditProfileDialog.vue';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';

const authStore = useAuthStore();
const profileStore = useProfileStore();

const editDialogVisible = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

function showSnackbar(text, color = 'success') {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

function openEditDialog() {
  editDialogVisible.value = true;
}

async function handleProfileUpdate(updatedData) {
  try {
    await profileStore.updateProfile(updatedData);
    editDialogVisible.value = false;
    showSnackbar('Profile saved successfully.');
  } catch (error) {
    console.error('Error updating profile:', error);
    showSnackbar('Failed to save profile. Please try again.', 'error');
  }
}

function handleProfileSaveError(errorMessage) {
  console.error('Error saving profile:', errorMessage);
  showSnackbar(errorMessage || 'An unexpected error occurred.', 'error');
}

async function handleLogin() {
  try {
    await authStore.login();
  } catch (error) {
    console.error('Login failed:', error);
  }
}

async function handleRegister() {
  try {
    await authStore.register();
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// Bij mount én bij inloggen: profiel binnenhalen
onMounted(async () => {
  authStore.updateAuthState();
  if (authStore.isLoggedIn) {
    await profileStore.fetchProfile();
  }
});

watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      profileStore.fetchProfile();
    }
  }
);
</script>

<style scoped>
.grey--text.text--darken-1 {
  color: #757575 !important;
}
.grey--text.text--darken-2 {
  color: #616161 !important;
}
.primary--text {
  color: #1976D2 !important;
}
.white--text {
  color: #FFFFFF !important;
}
.v-card-title.primary {
  background-color: #1976D2 !important;
}
</style>
