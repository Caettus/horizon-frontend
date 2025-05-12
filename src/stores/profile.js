import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import axios from 'axios';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasProfile: (state) => !!state.profile,
    profileData: (state) => state.profile,
  },

  actions: {
    async fetchProfile() {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        this.profile = null;
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        this.profile = response.data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.error = error.message;
        this.profile = null;
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
      this.error = null;

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
        const response = await axios.post(`/api/events/${eventId}/rsvp`, {}, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error RSVPing to event:', error);
        throw error;
      }
    },
  },
});
