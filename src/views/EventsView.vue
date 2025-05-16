<template>
  <v-container class="py-12">
    <!-- Pagetitel + search/filter -->
    <v-row class="align-center mb-8">
      <v-col cols="12" md="6">
        <h1 class="text-h4 font-weight-bold">Events</h1>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filters.search"
          prepend-inner-icon="mdi-magnify"
          label="Zoek events..."
          clearable
          @input="applyFilters"
        />
      </v-col>
    </v-row>

    <!-- Filters als chips -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-chip-group
          v-model="filters.category"
          multiple
          column
          class="d-flex flex-wrap"
        >
          <v-chip
            v-for="cat in categories"
            :key="cat"
            @click="applyFilters"
            outlined
            class="ma-1"
          >
            {{ cat }}
          </v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <!-- Events grid -->
    <v-row dense>
      <v-col
        v-for="event in filtered"
        :key="event.id"
        cols="12"
        sm="6"
        md="4"
      >
        <EventCard :event="event" />
      </v-col>

      <!-- Als geen resultaten -->
      <v-col cols="12" v-if="filtered.length === 0">
        <v-alert type="info" text>
          Geen events gevonden. Probeer je zoektermen of filters aan te passen.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/apiClient'
import EventCard from '@/components/EventCard.vue'

const route = useRoute()

const events = ref([])
const filters = ref({ search: '', category: [] })
const categories = ref(['Online', 'Offline', 'Netwerken', 'Workshop'])

async function loadEvents() {
  try {
    //apiClientChange
    const { data } = await apiClient.get('/events')
    events.value = data
  } catch (e) {
    console.error('Kon events niet laden:', e)
  }
}

function applyFilters() {
  // trigger computed
}

const filtered = computed(() => {
  return events.value.filter((e) => {
    const matchesSearch = e.title
      .toLowerCase()
      .includes(filters.value.search.toLowerCase())
    const matchesCategory =
      filters.value.category.length === 0 ||
      filters.value.category.includes(e.category)
    return matchesSearch && matchesCategory
  })
})

onMounted(loadEvents)

// wanneer routed van /events/create terug‑‑> refresh list
watch(() => route.fullPath, () => loadEvents())

</script>

<style scoped>
h1 {
  margin: 0;
}
</style>
