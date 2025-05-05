import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8083/',
  realm: 'horizon-realm',
  clientId: 'horizon-frontend',
});

export const initKeycloak = () =>
  keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    promiseType: 'native',
    pkceMethod: 'S256',
    flow: 'standard',
    responseMode: 'query',
    redirectUri: window.location.origin,
  })
    .then(authenticated => {
      if (!authenticated) throw new Error('Not authenticated');
      return keycloak;
    });


export default keycloak;
