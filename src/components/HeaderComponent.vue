<template>
  <!-- Vuetify App Bar -->
  <v-app-bar
    color="primary"
    dark
  >
    <!-- Titel/Logo -->
    <v-toolbar-title>Horizon</v-toolbar-title>

    <!-- Spacer duwt items naar rechts -->
    <v-spacer></v-spacer>

    <!-- Menu-items of knoppen -->
    <v-btn text @click="goToEvents">
      Events
    </v-btn>
    <v-btn text @click="onLogin">
      Login
    </v-btn>

    <v-btn text @click="onSignUp">
      Sign Up
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import router from '@/router'

function onLogin() {
  // Hier komt je inlog-functionaliteit / router push
  console.log("Login clicked!")
}

function goToEvents() {
  router.push('/events')
  console.log("Events clicked!")
}

function onSignUp() {
  // Sign-up flow
  console.log("Sign Up clicked!")
}
</script>

<style scoped>
/* Eventueel kun je hier extra styling doen,
   maar Vuetify neemt al veel voor z’n rekening */
</style>
