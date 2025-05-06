<!-- src/components/AppHeader.vue -->
<template>
  <v-app-bar color="primary" dark elevated>
    <v-container fluid>
      <v-row align="center">
        <!-- Logo/Titel met een klikbare link naar home -->
        <v-col cols="auto">
          <v-btn text @click="goToHome">
            <v-toolbar-title>Horizon</v-toolbar-title>
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
            <!-- Logout knop, alleen zichtbaar als ingelogd -->
            <v-btn v-if="isAuthenticated" text @click="logout">Log uit</v-btn>
          </transition>
          <transition name="fade">
            <!-- Login knop, alleen zichtbaar als niet ingelogd -->
            <v-btn v-if="!isAuthenticated" text @click="goToLogin">Log in</v-btn>
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
        <v-list-item link @click="isAuthenticated ? logout() : login()">
          <v-list-item-title>{{ isAuthenticated ? 'Log uit' : 'Log in' }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import keycloak from '../keycloak'

const router = useRouter()
const drawer = ref(false)
const isAuthenticated = ref(false)


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
function logout() {
  keycloak.logout({ redirectUri: window.location.origin })
}
function goToLogin() {
  router.push({ name: 'Login', query: { redirect: router.fullPath } })
  drawer.value = false
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
