import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import axios from 'axios';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    // profile holds backend data or null
    profile: null,
    loading: false,
    error: false,
  }),
  getters: {
    // computed flags based on profile state
    hasProfile: (state) => state.profile !== null,
    profileData: (state) => state.profile,
  },
  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = false;
      // reset stored profile before fetching
      this.profile = null;
      try {
        const response = await axios.get('/api/profile');
        // assign to state.profile, not to getters
        this.profile = response.data;
      } catch (e) {
        this.error = true;
        console.warn('Kon profiel niet laden (backend):', e);
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(profileData) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        throw new Error('Must be logged in to update profile');
      }

      this.loading = true;
      this.error = false;
      try {
        const response = await axios.put('/api/profile', profileData, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        this.profile = response.data;
        return response.data;
      } catch (error) {
        console.error('Error updating profile:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async rsvpToEvent(eventId) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        throw new Error('Must be logged in to RSVP');
      }
      try {
        const response = await axios.post(
          `/api/events/${eventId}/rsvp`,
          {},
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        );
        return response.data;
      } catch (error) {
        console.error('Error RSVPing to event:', error);
        throw error;
      }
    },
  },
});
