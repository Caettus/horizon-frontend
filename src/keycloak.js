// keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://keycloak.horizon.local/auth',
  realm: 'horizon-realm',
  clientId: 'horizon-frontend',
});

keycloak.onTokenExpired = () => {
  console.log('Keycloak token expired, attempting refresh.');
  keycloak.updateToken(30) // Refresh if expired within 30 seconds
    .then(refreshed => {
      if (refreshed) {
        console.log('Keycloak token refreshed successfully.');
      } else {
        console.log('Keycloak token still valid.');
      }
    })
    .catch(() => {
      console.error('Failed to refresh Keycloak token. Logging out.');
      keycloak.logout(); // Or keycloak.clearToken(); updateAuthState(); etc.
    });
};


export const initKeycloak = () =>
  keycloak.init({
    onLoad: 'check-sso', // This handles the initial load and redirects
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    checkLoginIframe: false, // Often causes issues, keep false unless specifically needed
    promiseType: 'native',
    pkceMethod: 'S256',
    // You might not need flow, responseMode, redirectUri if using standard flow defaults with check-sso
    // flow: 'standard',
    // responseMode: 'query',
    // redirectUri: window.location.origin, // onLoad:'check-sso' usually handles this
  })
    .then(authenticated => {
      console.log(`Keycloak init request finished. Authenticated status: ${authenticated}`);
      return authenticated; // Pass status along
    })
    .catch(error => {
      console.error("Keycloak init failed:", error);
      return false; // Indicate failure
    });

export default keycloak;
