<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <v-app>
    <AppHeader />

    <!-- Hoofdcontent met achtergrondkleur -->
    <v-main>
      <router-view />
    </v-main>
    <AppFooter />
  </v-app>
</template>
