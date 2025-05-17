import apiClient from './apiClient';

const RsvpService = {
  /**
   * Creates an RSVP for an event.
   * @param {object} payload - The RSVP data.
   * @param {string} payload.eventId - The ID of the event.
   * @param {string} payload.userId - The ID of the user (keycloakId).
   * @returns {Promise<object>} The response from the API.
   */
  createRsvp(payload) {
    return apiClient.post('/rsvps', payload);
  },

  /**
   * Fetches all RSVPs for a specific event.
   * @param {string} eventId - The ID of the event.
   * @returns {Promise<object>} The list of RSVPs.
   */
  getRsvpsByEventId(eventId) {
    return apiClient.get(`/v1/rsvps/event/${eventId}`);
  },
};

export default RsvpService;
