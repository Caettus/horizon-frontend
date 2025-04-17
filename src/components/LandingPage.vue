<!-- src/views/LandingPage.vue -->
<template>
  <div>
    <HeroSection />

    <!-- Features -->
    <FeaturesSection />

    <!-- Bottom CTA -->
    <v-sheet color="grey lighten-4" class="py-12 text-center">
      <h2 class="text-h4 mb-4">Klaar om te beginnen?</h2>
      <v-btn large color="primary" @click="goToSignup">Maak je account aan</v-btn>
    </v-sheet>
  </div>
</template>

<script setup>
import HeroSection from '@/components/HeroSection.vue'
import FeaturesSection from '@/components/FeaturesSection.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const goToSignup = () => router.push('/signup')
</script>
