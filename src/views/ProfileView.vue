<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card elevation="4" class="overflow-hidden">
          <!-- Banner Section -->
          <div class="profile-banner" />

          <!-- Avatar -->
          <div class="avatar-wrapper">
            <v-avatar size="120">
              <img :src="user.avatar || defaultAvatar" alt="Avatar" />
            </v-avatar>
          </div>

          <!-- User Info -->
          <v-card-text class="text-center pt-6">
            <h2 class="font-weight-bold mb-2">{{ user.username }}</h2>
            <p class="subtitle-1 grey--text">{{ user.email }}</p>
          </v-card-text>

          <v-divider />

          <!-- Actions -->
          <v-card-actions class="justify-center">
            <v-btn color="secondary" @click="openDialog">Bewerk Profiel</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Profile Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Profiel Bewerken</v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="formData.username"
              label="Naam"
              required
              :rules="[v => !!v || 'Naam is verplicht']"
            />
            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              required
              :rules="[v => /\S+@\S+\.\S+/.test(v) || 'Ongeldig email']"
            />
          </v-form>
          <v-alert v-if="error" type="error" dense class="mt-3">
            {{ error }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Annuleren</v-btn>
          <v-btn color="secondary" @click="saveProfile">Opslaan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const dialog = ref(false)
const user = reactive({ username: '', email: '', avatar: '' })
const formData = reactive({ username: '', email: '' })
const error = ref('')

const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg'

async function fetchProfile() {
  try {
    const { data } = await axios.get('/api/users/1')
    user.username = data.username || 'Onbekend'
    user.email = data.email || 'Onbekend'
    user.avatar = data.avatarUrl || defaultAvatar
  } catch (e) {
    error.value = 'Kon profiel niet laden.'
  }
}

function openDialog() {
  formData.username = user.username
  formData.email = user.email
  error.value = ''
  dialog.value = true
}

async function saveProfile() {
  try {
    const form = form.value
    if (!form.validate()) return
    await axios.put('/api/users/1', {
      username: formData.username,
      email: formData.email,
    })
    user.username = formData.username
    user.email = formData.email
    dialog.value = false
  } catch (e) {
    error.value = 'Opslaan mislukt. Probeer opnieuw.'
  }
}

onMounted(fetchProfile)
</script>

<style scoped>
.profile-banner {
  height: 120px;
  background: linear-gradient(135deg, #5e60ce, #64dfdf);
}

.avatar-wrapper {
  position: relative;
  top: -60px;
  display: flex;
  justify-content: center;
}

.v-avatar {
  border: 4px solid white;
}
</style>
