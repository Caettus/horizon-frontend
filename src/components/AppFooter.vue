<!-- src/components/AppFooter.vue -->
<template>
  <v-footer color="primary" padless>
    <v-col class="text-center white--text py-4">
      © 2025 Horizon. Alle rechten voorbehouden.
      <v-btn text class="ml-4" @click="showPrivacy = true">Privacyreglement</v-btn>
      <v-btn text class="ml-2" @click="goToSettings">Privacy instellingen</v-btn>
    </v-col>
    <PrivacyPolicyDialog v-model="showPrivacy" />
  </v-footer>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PrivacyPolicyDialog from './PrivacyPolicyDialog.vue';

const router = useRouter();
const showPrivacy = ref(false);

function goToSettings() {
  router.push('/privacy');
}
</script>
