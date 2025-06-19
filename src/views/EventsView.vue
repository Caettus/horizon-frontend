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

    <!-- Clear filters button -->
    <v-row v-if="hasActiveFilters" class="mb-6">
      <v-col>
        <v-btn @click="clearFilters" color="primary" outlined>
          Clear Filters
        </v-btn>
      </v-col>
    </v-row>

    <!-- Events grid -->
    <v-row v-if="loading" dense>
      <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
        <v-skeleton-loader type="image, article"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading" dense>
      <v-col
        v-for="event in filtered"
        :key="event.id"
        cols="12"
        sm="6"
        md="4"
      >
        <EventCard :event="event" @click="showEventDetails(event)" />
      </v-col>

      <!-- Als geen resultaten -->
      <v-col cols="12" v-if="filtered.length === 0">
        <v-alert v-if="loadingError" type="error" text>
          Oeps! We konden de evenementen niet laden, probeer het later opnieuw.
        </v-alert>
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-calendar-search</v-icon>
          <h2 class="text-h5 font-weight-medium my-4">No Events Found</h2>
          <p class="text-body-1 grey--text text--darken-1 mb-6">
            Try adjusting your search filters or be the first to create a new event!
          </p>
          <v-btn
            v-if="authStore.isLoggedIn"
            color="primary"
            @click="router.push({ name: 'CreateEvent' })"
          >
            Create an Event
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Event Details Modal -->
    <EventDetailsModal
      :model-value="isModalVisible"
      :event="selectedEvent"
      @update:model-value="isModalVisible = false"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/apiClient'
import EventCard from '@/components/EventCard.vue'
import EventDetailsModal from '@/components/EventDetailsModal.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const events = ref([])
const selectedEvent = ref(null)
const isModalVisible = ref(false)
const loading = ref(false)
const loadingError = ref(false)
const filters = ref({ search: '', category: [] })
const categories = ref(['Online', 'Offline', 'Netwerken', 'Workshop'])

async function loadEvents() {
  loading.value = true
  loadingError.value = false
  try {
    //apiClientChange
    const { data } = await apiClient.get('/events')
    events.value = data
  } catch (e) {
    console.error('Kon events niet laden:', e)
    loadingError.value = true
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  // trigger computed
}

function clearFilters() {
  filters.value.search = ''
  filters.value.category = []
}

function showEventDetails(event) {
  selectedEvent.value = event
  isModalVisible.value = true
}

const hasActiveFilters = computed(() => {
  const { search, category } = filters.value
  // The search can be null if cleared, so we check for truthiness
  return Boolean(search) || category.length > 0
})

const filtered = computed(() => {
  return events.value.filter((e) => {
    const searchLower = (filters.value.search || '').toLowerCase()
    const matchesSearch = e.title
      .toLowerCase()
      .includes(searchLower)
    const matchesCategory =
      filters.value.category.length === 0 ||
      filters.value.category.includes(e.category)
    return matchesSearch && matchesCategory
  })
})

onMounted(async () => {
  await loadEvents()
})

// wanneer routed van /events/create terug‑‑> refresh list
watch(
  () => route.fullPath,
  async () => {
    await loadEvents()
  }
)

</script>

<style scoped>
h1 {
  margin: 0;
}
</style>
