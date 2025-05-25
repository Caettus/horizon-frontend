<template>
  <v-container class="py-12">
    <h1 class="text-h4 font-weight-bold mb-8">Nieuw event aanmaken</h1>
    <EventForm @created="handleCreated" />
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import EventForm from '@/components/EventForm.vue'

const router = useRouter()

function handleCreated () {
  // Na succesvol opslaan: terug naar event‑overzicht
  router.push({ name: 'events' })
}
</script>
