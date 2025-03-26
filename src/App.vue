<script setup>
import { RouterView } from 'vue-router'
import HeaderComponent from './components/HeaderComponent.vue'
</script>

<template>
  <v-app>
    <!-- Je header (app-bar) -->
    <HeaderComponent />

    <!-- Hoofdcontent met achtergrondkleur -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>


