<!-- src/components/AppHeader.vue -->
<template>
  <v-app-bar color="primary" dark elevated>
    <v-container fluid>
      <v-row align="center">
        <!-- Logo/Titel met een klikbare link naar home -->
        <v-col cols="auto">
          <v-btn text @click="goToHome">
            <v-img
              :src="logo"
              alt="Horizon Logo"
              max-width="150"
              max-height="40"
              contain
            />
          </v-btn>
        </v-col>

        <v-spacer />

        <!-- Desktop navigatie -->
        <v-col cols="auto" class="d-none d-md-flex">
          <v-btn text @click="goToEvents">Events</v-btn>
          <v-btn text @click="goToCreateEvent">New Event</v-btn>
          <v-btn text @click="goToProfile">Profile</v-btn>

          <!-- Auth buttons -->
          <transition name="fade">
            <v-btn v-if="isLoggedIn" text @click="handleLogout">Log uit</v-btn>
          </transition>
          <transition name="fade">
            <v-btn v-if="!isLoggedIn" text @click="handleLogin">Log in</v-btn>
          </transition>

        </v-col>

        <!-- Mobile navigatie (hamburger-menu) -->
        <v-col cols="auto" class="d-flex d-md-none">
          <v-btn icon @click="toggleMenu">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Navigation drawer for mobile -->
    <v-navigation-drawer v-model="drawer" temporary right>
      <v-list nav>
        <v-list-item link @click="goToEvents">
          <v-list-item-title>Events</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="goToCreateEvent">
          <v-list-item-title>New Event</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="goToProfile">
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        <v-divider />
        <!-- Auth optie in drawer -->
        <v-list-item link @click="authStore.isLoggedIn ? handleLogout() : handleLogin()">
          <v-list-item-title>{{ isLoggedIn ? 'Log uit' : 'Log in' }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logo from '@/assets/logo.png'

const router = useRouter()
const drawer = ref(false)
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

// Update auth state when component mounts
onMounted(() => {
  authStore.updateAuthState()
})

function goToHome() {
  router.push('/')
}
function goToEvents() {
  router.push('/events')
  drawer.value = false
}
function goToCreateEvent() {
  router.push('/events/create')
  drawer.value = false
}
function goToProfile() {
  router.push('/profile')
  drawer.value = false
}
function toggleMenu() {
  drawer.value = !drawer.value
}
async function handleLogout() {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
async function handleLogin() {
  try {
    await authStore.login()
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
