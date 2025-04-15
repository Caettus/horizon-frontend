<!-- src/components/HeroSection.vue -->
<template>
<v-parallax src="https://images.unsplash.com/photo-1650556856632-a4c355de295d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" height="70vh">
  <div class="overlay"></div>
  <div class="hero-content">
    <h1 class="display-2 font-weight-bold white--text">Welkom bij Horizon</h1>
    <p class="subtitle-1 white--text">
      Ontdek en organiseer jouw evenementen, zowel online als offline!
    </p>
    <div class="cta-buttons">
      <v-btn large color="primary" @click="handleLogin">Log in</v-btn>
      <v-btn large outlined color="primary" @click="handleSignUp">Registreer</v-btn>
    </div>
  </div>
</v-parallax>

</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function handleLogin() {
  router.push('/login')
}
function handleSignUp() {
  router.push('/signup')
}
</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero-content {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.cta-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

</style>
