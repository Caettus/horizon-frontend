import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import keycloak from '../keycloak' // Import your Keycloak instance


const routes = [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: false, // Require authentication for this route
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresAuth: false, // Require authentication for this route
      },
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/EventsView.vue'),
      meta: {
        requiresAuth: false, // Require authentication for this route
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        requiresAuth: false, // Require authentication for this route
      },
    },
    {
      path: '/events/create',
      name: 'CreateEvent',
      component: () => import('../views/CreateEventView.vue'),
      meta: {
        requiresAuth: true, // Require authentication for this route
      },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/RegistrationView.vue'),
      meta: {
        requiresAuth: false, // Require authentication for this route
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        requiresAuth: false, // Require authentication for this route
      },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});


// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const { requiresAuth } = to.meta;

  // If Keycloak isn't ready/initialized yet, we might not have 'authenticated' status.
  // Your main.js ensures Keycloak init happens before app mount,
  // so $keycloak should be available.
  // We use the imported 'keycloak' instance as it's initialized by main.js.

  if (requiresAuth) {
    if (keycloak.authenticated) {
      // User is authenticated, proceed
      next();
    } else {
      // User is not authenticated, redirect to Keycloak login
      // Pass the intended path as a query parameter to redirect back after login
      console.log('User not authenticated, redirecting to login for route:', to.fullPath);
      // The $keycloak.login() method is asynchronous and causes a page redirect.
      // It doesn't return a promise that resolves in the current navigation flow for next().
      // The redirect should happen before next() is called or it should be the only call.
      keycloak.login({ redirectUri: window.location.origin + to.fullPath });
      // No next() call here as login() will redirect.
      // Or, if login() doesn't always redirect immediately (e.g. it opens a popup, though less common for standard flow):
      // next(false); // to cancel current navigation if login opens a popup/modal
    }
  } else {
    // Route does not require authentication
    // If user is authenticated and tries to access login/register, redirect to home
    if ((to.name === 'Login' || to.name === 'Register') && keycloak.authenticated) {
      next({ name: 'Home' });
    } else {
      next();
    }
  }
});


export default router
