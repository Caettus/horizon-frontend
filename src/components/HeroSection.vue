<!-- src/components/HeroSection.vue -->
<template>
  <v-sheet
    class="hero-sheet"
    height="100vh"
    tile
    elevation="0"
  >
    <div class="hero-overlay" />
    <v-container
      class="fill-height d-flex flex-column justify-center align-center text-center"
    >
      <h1 class="hero-title">Welkom bij Horizon</h1>
      <p class="hero-subtitle">
        Ontdek events, connect met nieuwe mensen én organiseer je eigen meetups.
      </p>
      <div class="cta-buttons">
        <v-btn large color="secondary" @click="handleLogin">Log in</v-btn>
        <v-btn large outlined color="secondary" @click="handleSignUp">
          Registreer
        </v-btn>
      </div>
    </v-container>
  </v-sheet>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const handleLogin = () => router.push('/login')
const handleSignUp = () => router.push('/signup')
</script>

<style scoped>
.hero-sheet {
  position: relative;
  background: linear-gradient(135deg, #5e60ce, #64dfdf);
  overflow: hidden;
}

.hero-overlay {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(4px);
  opacity: 0.2;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  animation: fadeInUp 1s ease-out forwards;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 1rem;
  animation: fadeInUp 1.2s ease-out forwards;
}

.cta-buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1.5rem;
  animation: fadeInUp 1.4s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
