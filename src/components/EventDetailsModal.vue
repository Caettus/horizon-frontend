<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="handleUpdate"
    persistent
    max-width="600"
  >
    <v-card v-if="event">
      <v-img :src="event.image || placeholder" height="250" cover />

      <v-card-title class="text-h6">{{ event.title }}</v-card-title>
      <v-card-subtitle>
        <span v-if="event.date">{{ event.date }}</span>
        <span v-if="event.location"> • {{ event.location }}</span>
      </v-card-subtitle>

      <v-card-text>
        <p>{{ event.description }}</p>
        <div class="d-flex flex-wrap">
          <v-chip v-if="event.category" class="ma-1" color="primary" outlined small>
            {{ event.category }}
          </v-chip>
          <v-chip
            v-for="tag in event.tags || []"
            :key="tag"
            class="ma-1"
            small
          >
            {{ tag }}
          </v-chip>
        </div>

        <!-- RSVP'd Users Section -->
        <v-divider class="my-4"></v-divider>
        <h4 class="text-subtitle-1 font-weight-medium">Attendees</h4>
        <div v-if="isLoadingRsvps" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p>Loading attendees...</p>
        </div>
        <div v-else-if="errorRsvps" class="text-error pa-2">
          <p>Could not load attendees: {{ errorRsvps }}</p>
        </div>
        <div v-else-if="rsvpedUsers.length > 0">
          <v-list dense>
            <v-list-item v-for="user in rsvpedUsers" :key="user.id">
              <template #prepend>
                <v-avatar>
                  <v-img :src="user.avatarUrl || defaultAvatar" :alt="user.username" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ user.username || user.name || 'Unnamed User' }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
        <div v-else>
          <p class="text-body-2 grey--text">No one has RSVP'd yet. Be the first!</p>
        </div>
        <!-- End RSVP'd Users Section -->

      </v-card-text>

      <v-alert v-if="rsvpError" type="error" dense class="mx-4 mb-2">
        {{ rsvpError }}
      </v-alert>

      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" @click="handleClose">Sluiten</v-btn>
        <v-btn
          v-if="event && event.id"
          color="success"
          @click="onRsvpClick"
          :loading="isRsvping"
          :disabled="isRsvping || (authStore.isLoggedIn && isUserRsvped)"
        >
          {{ authStore.isLoggedIn && isUserRsvped ? "You've RSVP'd" : 'RSVP' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar for feedback -->
  <v-snackbar v-model="snackbar" timeout="3000" top color="success">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn text @click="snackbar = false">Close</v-btn>
    </template>
  </v-snackbar>

  <!-- Login Prompt Dialog -->
  <v-dialog v-model="showLoginPrompt" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h5">Login Required</v-card-title>
      <v-card-text>
        You need to be logged in to RSVP for this event. Please log in or create an account to
        continue.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="showLoginPrompt = false">Cancel</v-btn>
        <v-btn color="primary" text @click="goToLogin">Login</v-btn>
        <v-btn color="secondary" text @click="goToRegister">Register</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/apiClient'
import RsvpService from '@/services/rsvpService'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  event: { type: Object, required: false, default: null },
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const authStore = useAuthStore()
const isRsvping = ref(false)
const rsvpError = ref(null)
const showLoginPrompt = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')

const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg'

function showSnackbar(text) {
  snackbarText.value = text
  snackbar.value = true
}

// State for RSVP'd users list
const rsvpedUsers = ref([])
const isLoadingRsvps = ref(false)
const errorRsvps = ref(null)

const isUserRsvped = computed(() => {
  if (!authStore.isLoggedIn || !authStore.user || !rsvpedUsers.value.length) {
    return false
  }
  return rsvpedUsers.value.some(user => user.id === authStore.user.id)
})

const handleUpdate = (val) => emit('update:modelValue', val)
const handleClose = () => {
  emit('update:modelValue', false)
  // Reset RSVP list state on close
  rsvpedUsers.value = []
  isLoadingRsvps.value = false
  errorRsvps.value = null
}

async function handleRsvp() {
  if (!props.event || !props.event.id || !authStore.user || !authStore.user.id) {
    console.error('Event ID or User ID is missing for RSVP.')
    return
  }

  const optimisticUser = {
    id: authStore.user.id,
    username: authStore.user.username,
    // avatarUrl can be added if available in authStore.user
    avatarUrl: authStore.user.avatarUrl || defaultAvatar
  };

  // Optimistic update
  rsvpedUsers.value.push(optimisticUser);

  isRsvping.value = true
  rsvpError.value = null
  try {
    const payload = {
      eventId: props.event.id,
      userId: authStore.user.id,
    }
    await RsvpService.createRsvp(payload)
    showSnackbar("Successfully RSVP'd!")
    // On success, no need to refetch, the UI is already updated.
  } catch (error) {
    console.error('RSVP failed:', error.response?.data || error.message)
    rsvpError.value = 'Failed to RSVP. Please try again later.'

    // Revert optimistic update on failure
    const index = rsvpedUsers.value.findIndex(user => user.id === optimisticUser.id);
    if (index > -1) {
      rsvpedUsers.value.splice(index, 1);
    }
  } finally {
    isRsvping.value = false
  }
}

function onRsvpClick() {
  if (authStore.isLoggedIn) {
    handleRsvp()
  } else {
    showLoginPrompt.value = true
  }
}

function goToLogin() {
  showLoginPrompt.value = false
  handleClose() // Close the main modal
  router.push('/login')
}

function goToRegister() {
  showLoginPrompt.value = false
  handleClose() // Close the main modal
  router.push('/signup')
}

// Fetch RSVP'd users
async function fetchRsvpedUsers(eventId) {
  if (!eventId) return

  isLoadingRsvps.value = true
  errorRsvps.value = null
  rsvpedUsers.value = [] // Clear previous results

  try {
    // Step A: Get RSVPs for the event
    const rsvpResponse = await RsvpService.getRsvpsByEventId(eventId)
    const rsvps = rsvpResponse.data

    if (!rsvps || rsvps.length === 0) {
      rsvpedUsers.value = []
      isLoadingRsvps.value = false
      return
    }

    // Step B: Collect unique userIds (keycloakIds)
    const userIds = [...new Set(rsvps.map(rsvp => rsvp.userId).filter(id => id))]

    if (userIds.length === 0) {
      rsvpedUsers.value = []
      isLoadingRsvps.value = false
      return
    }

    // Step C: Fetch user profiles in batch
    // Assuming UserService endpoint is /users/batch?ids=id1,id2,id3
    const usersResponse = await apiClient.get(`/users/batch?ids=${userIds.join(',')}`)
    const users = usersResponse.data

    // Step D: Combine data (users are already the profiles we need)
    // We expect users to be an array of user objects with at least id and username/name
    rsvpedUsers.value = users || []
  } catch (err) {
    console.error('Failed to fetch RSVPd users or their profiles:', err)
    errorRsvps.value = err.response?.data?.message || err.message || 'An unknown error occurred.'
  } finally {
    isLoadingRsvps.value = false
  }
}

// Watch for event changes and modal visibility to fetch RSVPs
watch(
  [() => props.modelValue, () => props.event?.id],
  ([isVisible, eventId], [prevIsVisible, prevEventId]) => {
    if (isVisible && eventId) {
      // Fetch if:
      // 1. Modal just opened/became visible with a valid eventId.
      // 2. EventId changed while the modal was already visible.
      const modalOpenedWithEvent = !prevIsVisible && isVisible && eventId;
      const eventChangedWhileVisible = isVisible && eventId !== prevEventId && prevEventId !== undefined; // check prevEventId to avoid first run with immediate:true if eventId is already set

      if (modalOpenedWithEvent || eventChangedWhileVisible) {
        fetchRsvpedUsers(eventId);
      }
    } else if (!isVisible) {
      // Clear data if modal is closed or event becomes invalid
      rsvpedUsers.value = [];
      isLoadingRsvps.value = false;
      errorRsvps.value = null;
    }
  },
  {
    immediate: true // Handles initial state and when eventId becomes available while modal is open
  }
);

const placeholder =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
</script>
