import apiClient from './apiClient';

const RsvpService = {
  /**
   * Creates an RSVP for an event.
   * @param {object} payload - The RSVP data.
   * @param {string} payload.eventId - The ID of the event.
   * @param {string} payload.userId - The ID of the user (keycloakId).
   * @param {string} [payload.status='ATTENDING'] - The RSVP status.
   * @returns {Promise<object>} The response from the API.
   */
  createRsvp(payload) {
    const { eventId, userId, status = 'ATTENDING' } = payload;
    return apiClient.post(`/rsvps?eventId=${eventId}&status=${status}`, { userId });
  },

  /**
   * Fetches all RSVPs for a specific event.
   * @param {string} eventId - The ID of the event.
   * @returns {Promise<object>} The list of RSVPs.
   */
  getRsvpsByEventId(eventId) {
    return apiClient.get(`/rsvps/event/${eventId}`);
  },

  /**
   * Fetches all RSVPs for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object>} The list of RSVPs.
   */
  getRsvpsByUserId(userId) {
    return apiClient.get(`/rsvps/user/${userId}`);
  },
};

export default RsvpService;
