<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="7">
        <div v-if="isAuthenticated">
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
                <v-btn icon color="primary" @click="fetchEventCount" :loading="loadingEventCount" title="Refresh event count">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-actions class="justify-center pa-4">
              <v-btn color="secondary" rounded @click="openDialog" prepend-icon="mdi-pencil">
                Edit Profile
              </v-btn>
              <v-btn color="primary" rounded @click="navigateToKeycloakAccount" prepend-icon="mdi-account-cog" class="ml-2">
                Manage Account
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <div v-else>
          <v-card elevation="4" class="text-center pa-8 guest-card">
            <v-icon size="80" color="primary" class="mb-6">mdi-account-lock-outline</v-icon>
            <h2 class="text-h5 font-weight-bold mb-3">Your Profile Awaits!</h2>
            <p class="subtitle-1 grey--text text--darken-1 mb-8">
              Please log in or create an account to view and manage your profile,
              track your events, and connect with the Horizon community.
            </p>
            <v-row>
              <v-col cols="12" sm="6">
                <v-btn color="primary" block large rounded @click="handleLogin" prepend-icon="mdi-login-variant">
                  Login
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn color="secondary" block large rounded @click="handleRegister" prepend-icon="mdi-account-plus-outline">
                  Register
                </v-btn>
              </v-col>
            </v-row>
            <p class="text-caption grey--text mt-8">
              Joining is quick and opens up a world of possibilities!
            </p>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-if="isAuthenticated" v-model="dialog" max-width="550px" persistent>
      <v-card>
        <v-card-title class="text-h6 primary white--text">
          <v-icon left dark>mdi-pencil-box</v-icon>
          Edit Your Profile
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-5">
          <v-form ref="profileFormRef" v-model="isFormValid">
            <v-text-field
              v-model="formData.username"
              label="Display Name"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              required
              :rules="[v => !!v || 'Display Name is required']"
              class="mb-3"
            />
            <v-text-field
              v-model="formData.email"
              label="Email Address"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              type="email"
              required
              :rules="[
                v => !!v || 'Email is required',
                v => /\S+@\S+\.\S+/.test(v) || 'Email must be valid'
              ]"
              class="mb-3"
              disabled
              hint="Email cannot be changed here. Use 'Manage Account'."
              persistent-hint
            />
            <v-text-field
              v-model="formData.avatar"
              label="Avatar URL (Optional)"
              prepend-inner-icon="mdi-image"
              variant="outlined"
              class="mb-3"
            />
          </v-form>
          <v-alert v-if="error" type="error" dense class="mt-3" prominent border="left">
            {{ error }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveProfile"
            :loading="savingProfile"
            :disabled="!isFormValid || savingProfile"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed, inject } from 'vue';
import { useRouter } from 'vue-router'; // For login/register redirects
import axios from 'axios'; // Assuming you have axios configured

// --- Keycloak & Router ---
const keycloak = inject('keycloak');
const router = useRouter();

// --- State References ---
const dialog = ref(false);
const error = ref('');
const eventCount = ref(0);
const loadingEventCount = ref(false);
const savingProfile = ref(false);
const profileFormRef = ref(null); // Reference to the v-form
const isFormValid = ref(false); // Validity of the form

// --- User Data ---
const user = reactive({
  id: null, // Store user ID from Keycloak if needed for API calls
  username: '',
  email: '',
  avatar: '',
  banner: '' // Example: if you have a banner image
});

const formData = reactive({
  username: '',
  email: '',
  avatar: ''
});

// --- Defaults & Computed Properties ---
const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg'; // Default if no avatar
const defaultBanner = 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'; // Default banner

const isAuthenticated = computed(() => keycloak && keycloak.authenticated);

// --- Methods ---

// Initialize profile data
async function initializeProfile() {
  if (!isAuthenticated.value) return;

  try {
    // Get user info from Keycloak token
    const tokenParsed = keycloak.tokenParsed;
    if (tokenParsed) {
      user.id = tokenParsed.sub;
      user.username = tokenParsed.preferred_username || tokenParsed.name || '';
      user.email = tokenParsed.email || '';

      // Initialize form data with current values
      formData.username = user.username;
      formData.email = user.email;
      formData.avatar = user.avatar;
    }

    // Fetch event count
    await fetchEventCount();
  } catch (error) {
    console.error('Error initializing profile:', error);
    error.value = 'Failed to load profile data. Please try again.';
  }
}

// Fetch event count from your backend
async function fetchEventCount() {
  if (!isAuthenticated.value) return;

  loadingEventCount.value = true;
  try {
    // Replace with your actual API endpoint
    const response = await axios.get('/api/events/count', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`
      }
    });
    eventCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching event count:', error);
  } finally {
    loadingEventCount.value = false;
  }
}

// Dialog actions
function openDialog() {
  if (!isAuthenticated.value) return;
  // Reset form data to current user state from Keycloak/backend
  formData.username = user.username;
  formData.email = user.email; // Keep email display, but it's often not editable here
  formData.avatar = user.avatar === defaultAvatar ? '' : user.avatar;
  error.value = '';
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  if (profileFormRef.value) {
    profileFormRef.value.resetValidation();
  }
}

// Save profile (to your backend)
async function saveProfile() {
  if (!isAuthenticated.value || !profileFormRef.value) return;

  // Validate form
  const { valid } = await profileFormRef.value.validate();
  if (!valid) {
    error.value = 'Please correct the errors in the form.';
    return;
  }

  savingProfile.value = true;
  error.value = '';
  try {
    // PUT to your backend API. Your backend should handle updating its user record.
    // It should NOT try to update Keycloak password or core identity details directly
    // unless it has specific service account privileges and logic for it.
    // Typically, users update their own Keycloak profile via Keycloak's account mgmt.
    const payload = {
      username: formData.username,
      // email: formData.email, // Usually not updated this way, Keycloak handles it.
      avatarUrl: formData.avatar || null, // Send null if empty to remove avatar
    };
    // Replace '/api/profile/me' with your actual update endpoint
    await axios.put(`/api/profile/me`, payload);

    // Update local state
    user.username = formData.username;
    user.avatar = formData.avatar || defaultAvatar;

    dialog.value = false;
    // Optionally, show a success snackbar
  } catch (e) {
    console.error('Profile save failed:', e);
    error.value = e.response?.data?.message || 'Saving profile failed. Please try again.';
  } finally {
    savingProfile.value = false;
  }
}

// --- Keycloak Actions for Unauthenticated Users ---
function handleLogin() {
  if (keycloak && !keycloak.authenticated) {
    // Redirect to the original page after login, or home if none specified
    const redirectUri = window.location.origin + (router.currentRoute.value.query.redirect || '/');
    keycloak.login({ redirectUri });
  }
}

function handleRegister() {
  if (keycloak && !keycloak.authenticated) {
    keycloak.register(); // Redirects to Keycloak registration page
  }
}

function navigateToKeycloakAccount() {
  if (keycloak && typeof keycloak.accountManagement === 'function') {
    keycloak.accountManagement().catch(err => console.error("Failed to navigate to account management:", err));
  } else {
    alert("Account management is not available.");
  }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  // Wait for Keycloak to be initialized (as per your main.js)
  if (keycloak) { // Check if $keycloak is injected
    initializeProfile();
  } else {
    // Handle case where Keycloak might not be ready, though your main.js should ensure it is.
    // This could be a fallback or an error state.
    console.warn("Keycloak instance not available on mount for profile page.");
  }
});
</script>

<style scoped>
.profile-banner {
  height: 180px; /* Increased height */
  background-size: cover;
  background-position: center;
  border-radius: 4px 4px 0 0; /* Match v-card default border-radius if any */
  background-color: #e0e0e0; /* Fallback color */
}

.avatar-wrapper {
  margin-top: -60px; /* Pull avatar up over banner */
  display: flex;
  justify-content: center;
  margin-bottom: -16px; /* Adjust spacing for content below */
}

.v-avatar img {
  border: 4px solid white; /* White border around avatar */
  object-fit: cover;
}

.profile-card {
  border-radius: 12px !important; /* More rounded cards */
}

.guest-card {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.9); /* Slightly transparent for effect if you add a page background */
}

.v-btn {
  text-transform: none; /* Keep button text casing as is */
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
.white--text {
  color: #FFFFFF !important;
}

.v-card-title.primary {
  background-color: #1976D2 !important; /* Vuetify primary color */
}
</style>
