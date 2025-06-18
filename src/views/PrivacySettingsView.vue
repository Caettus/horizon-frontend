<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h6">Privacy instellingen</v-card-title>
          <v-card-text>
            <p>Pas hier aan welke gegevens je wilt delen. Deze opties zijn puur ter illustratie.</p>
            <v-switch
              v-model="shareData"
              label="Sta het delen van anonieme gebruiksdata toe"
            />
            <v-switch
              v-model="receiveEmails"
              label="Ontvang updates en nieuws per e-mail"
            />
            <v-switch
              v-model="personalizedAds"
              label="Toon gepersonaliseerde inhoud"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="saveSettings">Opslaan</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const shareData = ref(false);
const receiveEmails = ref(false);
const personalizedAds = ref(false);

const router = useRouter();

function saveSettings() {
  // Functionality not implemented; navigate back to previous page
  router.back();
}
</script>
