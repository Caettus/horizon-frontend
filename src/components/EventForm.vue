<template>
  <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field v-model="event.title" :rules="[r.required]" label="Titel" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="event.location" :rules="[r.required]" label="Locatie" />
      </v-col>

      <v-col cols="12">
        <v-textarea v-model="event.description" :rules="[r.required]" label="Beschrijving" rows="4" />
      </v-col>

      <v-col cols="12" md="6">
        <VueDatePicker
          v-model="event.startDate"
          :min-date="new Date()"
          :rules="[r.required]"
          placeholder="Startdatum en -tijd"
          required
        ></VueDatePicker>
      </v-col>
      <v-col cols="12" md="6">
        <VueDatePicker
          v-model="event.endDate"
          :min-date="event.startDate || new Date()"
          :rules="[r.required, r.endAfterStart]"
          placeholder="Einddatum en -tijd"
          required
        ></VueDatePicker>
      </v-col>

      <v-col cols="12">
        <v-select v-model="event.category" :items="categories" :rules="[r.required]" label="Categorie" />
      </v-col>

      <v-col cols="12">
        <v-label class="text-subtitle-1">Eventbannerafbeelding</v-label>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="event.imageUrl"
          label="Afbeeldings-URL"
          placeholder="https://voorbeeld.com/afbeelding.png"
          clearable
          hint="Plak een URL van een afbeelding voor de banner van je evenement."
          persistent-hint
        />
      </v-col>

      <v-col cols="12">
        <div class="text-caption">Of kies een van onze suggesties:</div>
        <v-row dense class="mt-2">
          <v-col
            v-for="img in imageOptions"
            :key="img.url"
            cols="4"
            sm="2"
            class="pa-1"
          >
            <v-img
              :src="img.url"
              height="80"
              cover
              class="rounded-lg cursor-pointer"
              :class="{ 'border-lg border-primary': event.imageUrl === img.url }"
              @click="event.imageUrl = img.url"
            >
              <template #placeholder>
                <v-skeleton-loader type="image" />
              </template>
            </v-img>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="8">
        <v-combobox v-model="event.tags" label="Tags" multiple chips clearable />
      </v-col>

      <v-col cols="12" md="4" class="d-flex align-center">
        <v-switch v-model="event.isPrivate" label="Privé event" inset />
      </v-col>

      <v-col cols="12" class="text-right">
        <v-btn :loading="loading" color="primary" type="submit">Opslaan</v-btn>
        <div v-if="errorMsg" class="text-error mt-2">{{ errorMsg }}</div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import apiClient from '@/services/apiClient'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['created'])

const imageOptions = [
  { title: 'Gaming',  url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Karaoke', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Workshop',url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d' },
]

const categories = ['Online', 'Offline', 'Netwerken', 'Workshop']

const errorMsg = ref('')

const event = ref({
  title: '',
  description: '',
  location: '',
  startDate: null,
  endDate: null,
  category: null,
  tags: [],
  isPrivate: false,
  organizerId: null,
  imageUrl: '',
})

const valid = ref(false)
const loading = ref(false)

const r = {
  required: v => !!v || 'Verplicht veld',
  endAfterStart: () => {
    if (!event.value.startDate || !event.value.endDate) return true
    return new Date(event.value.endDate) >= new Date(event.value.startDate) || 'Einddatum/tijd moet na de start liggen'
  },
  startDateInFuture: () => {
    if (!event.value.startDate) return true
    return new Date(event.value.startDate) > new Date() || 'Startdatum moet in de toekomst liggen'
  }
}

async function onSubmit () {
  if (!valid.value) return
  loading.value = true

  const authStore = useAuthStore()
  console.log('AuthStore isLoggedIn:', authStore.isLoggedIn);
  console.log('AuthStore user:', authStore.user);
  if (authStore.user) {
    console.log('AuthStore user ID:', authStore.user.id);
  }

  if (authStore.isLoggedIn && authStore.user && authStore.user.id) {
    event.value.organizerId = authStore.user.id
    console.log('Set event.organizerId to:', event.value.organizerId);
  } else {
    console.error('User not logged in or user ID not available. Cannot set organizerId.')
    errorMsg.value = 'You must be logged in to create an event.'
    loading.value = false
    console.log('event.organizerId remains:', event.value.organizerId); // Log in case of failure too
    return
  }

  try {
    const payload = {
      ...event.value,
      startDate: event.value.startDate && new Date(event.value.startDate).toISOString(),
      endDate: event.value.endDate && new Date(event.value.endDate).toISOString(),
    }
    console.log('Payload to be sent to /events:', payload); // Log the payload
    await apiClient.post('/events', payload)
    emit('created')
    router.push({ name: 'events' })
  }
  catch (err) {
    console.error('Event opslaan mislukt', err)
    if (err.response && err.response.status === 422) {
      errorMsg.value = 'Ongeldige invoer. Controleer de gegevens.'
    }
    else {
      errorMsg.value = err.response?.data?.message
    }
  }
  finally {
    loading.value = false
  }
}
</script>
