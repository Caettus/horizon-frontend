<template>
  <v-card class="event-card" elevation="2" hover>
    <v-img
      :src="event.image || placeholder"
      height="180"
      cover
    />
    <v-card-text>
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="font-weight-bold text-subtitle-1">{{ event.title }}</span>
        <v-chip small outlined>{{ event.date }}</v-chip>
      </div>
      <p class="text-body-2 mb-4">{{ event.description }}</p>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text color="primary" @click="$emit('click', event)">
        Bekijk
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const placeholder = 'https://via.placeholder.com/400x200?text=Geen+afbeelding'
</script>

<style scoped>
.event-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
}
.event-card:hover {
  transform: translateY(-4px);
}
</style>
