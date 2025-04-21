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

      <v-col cols="12" md="4">
        <v-menu close-on-content-click>
          <template #activator="{ props }">
            <v-text-field v-bind="props" v-model="event.startDate" label="Startdatum" prepend-inner-icon="mdi-calendar" readonly />
          </template>
          <v-date-picker v-model="event.startDate" />
        </v-menu>
      </v-col>

      <v-col cols="12" md="4">
        <v-menu close-on-content-click>
          <template #activator="{ props }">
            <v-text-field v-bind="props" v-model="event.endDate" label="Einddatum" prepend-inner-icon="mdi-calendar" readonly />
          </template>
          <v-date-picker v-model="event.endDate" />
        </v-menu>
      </v-col>

      <v-col cols="12" md="4">
        <v-select v-model="event.category" :items="categories" :rules="[r.required]" label="Categorie" />
      </v-col>

      <v-col cols="12" md="8">
        <v-combobox v-model="event.tags" label="Tags" multiple chips clearable />
      </v-col>

      <v-col cols="12" md="4" class="d-flex align-center">
        <v-switch v-model="event.isPrivate" label="Privé event" inset />
      </v-col>

      <v-col cols="12" class="text-right">
        <v-btn :loading="loading" color="primary" type="submit">Opslaan</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['created'])

const categories = ['Online', 'Offline', 'Netwerken', 'Workshop']

const event = ref({
  title: '',
  description: '',
  location: '',
  startDate: null,
  endDate: null,
  category: null,
  tags: [],
  isPrivate: false,
  organizerId: null, // vul vanuit auth‑provider indien beschikbaar
})

const valid = ref(false)
const loading = ref(false)

const r = {
  required: v => !!v || 'Verplicht veld',
}

async function onSubmit () {
  if (!valid.value) return
  loading.value = true
  try {
    // Backend verwacht ISO‑strings, converteer LocalDate -> string
    const payload = {
      ...event.value,
      startDate: event.value.startDate && new Date(event.value.startDate).toISOString(),
      endDate: event.value.endDate && new Date(event.value.endDate).toISOString(),
    }
    await axios.post('/api/events', payload)
    emit('created')
  } catch (err) {
    console.error('Event opslaan mislukt', err)
  } finally {
    loading.value = false
  }
}
</script>
