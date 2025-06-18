import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import keycloak from '../keycloak'
import { useAuthStore } from '../stores/auth'


const routes = [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/EventsView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/events/create',
      name: 'CreateEvent',
      component: () => import('../views/CreateEventView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/RegistrationView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacySettingsView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});


router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  await authStore.updateAuthState();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    console.log('User not authenticated, redirecting to login for route:', to.fullPath);
    return keycloak.login({ redirectUri: window.location.origin + to.fullPath });
  }

  if ((to.name === 'login' || to.name === 'signup') && authStore.isLoggedIn) {
    return next({ name: 'home' });
  }

  next();
});



export default router
