import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
//import axios from 'axios';
import apiClient from '@/services/apiClient';
//apiClientChange

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
      this.profile = null;
      try {
        //apiClientChange
        const response = await apiClient.get('/users/profile');
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
        //apiClientChange
        const response = await apiClient.put('/users/profile', profileData, {
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
        //apiClientChange
        const response = await apiClient.post(
          `/api/events/${eventId}/rsvps`,
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
