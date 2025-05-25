<template>
  <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="550px" persistent>
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
            clearable
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
          @click="submitProfile"
          :loading="savingProfile"
          :disabled="!isFormValid || savingProfile"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, inject } from 'vue';
import axios from 'axios';

const props = defineProps({
  modelValue: Boolean, // For v-model binding
  user: {
    type: Object,
    required: true,
    default: () => ({}) // Add default empty object
  }
});

const emit = defineEmits(['update:modelValue', 'profile-saved', 'profile-save-error']);

const keycloak = inject('keycloak');

// --- State ---
const profileFormRef = ref(null);
const isFormValid = ref(false);
const savingProfile = ref(false);
const error = ref('');

const formData = reactive({
  username: '',
  email: '',
  avatar: ''
});

// Default used for comparison when initializing form data
const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg';

// --- Methods ---
function initializeForm() {
  if (props.user) {
    formData.username = props.user.username || '';
    formData.email = props.user.email || '';
    // Show empty string in form if avatar is default, otherwise show the URL
    formData.avatar = props.user.avatar === defaultAvatar ? '' : (props.user.avatar || '');
  }
  error.value = ''; // Clear previous errors
  if (profileFormRef.value) {
      profileFormRef.value.resetValidation(); // Reset validation on open
  }
}

function closeDialog() {
  emit('update:modelValue', false); // Close the dialog using v-model update
}

async function submitProfile() {
  if (!keycloak?.authenticated || !profileFormRef.value) return;

  const { valid } = await profileFormRef.value.validate();
  if (!valid) {
    error.value = 'Please correct the errors in the form.';
    return;
  }

  savingProfile.value = true;
  error.value = '';
  try {
    const payload = {
      // Only send fields that your backend expects
      username: formData.username,
      // Do not send email if it's not updatable via this endpoint
      // email: formData.email,
      avatarUrl: formData.avatar || null // Send null/empty string as per backend expectation
    };

    // Replace '/api/profile/me' with your actual update endpoint
    await axios.put(`/api/users/profile`, payload, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
    });

    // Emit event with updated data (construct based on what actually changed)
    const updatedUserData = {
        username: formData.username,
        avatar: formData.avatar || defaultAvatar // Use default if cleared
        // Include other fields from response if necessary
    };
    emit('profile-saved', updatedUserData);
    closeDialog();

  } catch (e) {
    console.error('Profile save failed:', e);
    error.value = e.response?.data?.message || 'Saving profile failed. Please try again.';
    emit('profile-save-error', error.value); // Optionally emit error
  } finally {
    savingProfile.value = false;
  }
}

// --- Watchers ---
// Watch for dialog opening to initialize the form
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    initializeForm();
  }
});

// Watch for user prop changes (e.g., initial load) to initialize form
watch(() => props.user, () => {
   if (props.modelValue) { // Only re-initialize if dialog is already open
      initializeForm();
   }
}, { deep: true, immediate: true }); // Immediate might be needed if dialog opens before user is loaded

</script>

<style scoped>
.v-card-title.primary {
  background-color: #1976D2 !important; /* Vuetify primary color */
}
.white--text {
  color: #FFFFFF !important;
}
/* Add other specific styles if needed */
</style>
