// keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8083',
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
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    checkLoginIframe: false,
    promiseType: 'native',
    pkceMethod: 'S256',
  })
    .then(authenticated => {
      console.log(`Keycloak init request finished. Authenticated status: ${authenticated}`);
      return authenticated;
    })
    .catch(error => {
      console.error("Keycloak init failed:", error);
      return false;
    });

export default keycloak;
