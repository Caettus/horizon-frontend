import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8083/',
  realm: 'horizon-realm',
  clientId: 'horizon-frontend',
});

export const initKeycloak = () =>
  keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    checkLoginIframe: false,
    promiseType: 'native',
    pkceMethod: 'S256',
    flow: 'standard',
    responseMode: 'query',
    redirectUri: window.location.origin,
  })
    .then(authenticated => {
      console.log('Keycloak initialized:', authenticated);
      return keycloak;
    });


export default keycloak;
