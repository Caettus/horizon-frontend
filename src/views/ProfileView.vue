<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="7">
        <AuthenticatedProfile
          v-if="authStore.isLoggedIn && profileStore.profileData"
          :user="profileStore.profileData"
          @edit-profile="openEditDialog"
        />
        <GuestProfile
          v-else-if="!authStore.isLoggedIn"
          @login="handleLogin"
          @register="handleRegister"
        />
        <!-- Loading state -->
        <v-skeleton-loader
          v-else
          type="card-avatar, article, actions"
        />
      </v-col>
    </v-row>

    <!-- Edit Dialog managed by this parent component -->
    <EditProfileDialog
      v-if="authStore.isLoggedIn"
      v-model="editDialogVisible"
      :user="profileStore.profileData"
      @profile-saved="handleProfileUpdate"
      @profile-save-error="handleProfileSaveError"
    />
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

// --- State ---
const editDialogVisible = ref(false);

// --- Methods ---
function openEditDialog() {
  editDialogVisible.value = true;
}

async function handleProfileUpdate(updatedData) {
  try {
    await profileStore.updateProfile(updatedData);
    editDialogVisible.value = false;
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}

function handleProfileSaveError(errorMessage) {
  console.error('Error saving profile:', errorMessage);
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

// --- Lifecycle Hooks ---
onMounted(async () => {
  // Update auth state
  authStore.updateAuthState();

  // If authenticated, fetch profile data
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
