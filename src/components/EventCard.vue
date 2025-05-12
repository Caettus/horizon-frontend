<template>
  <v-card class="event-card" elevation="2" hover @click="$emit('click', event)" cursor="pointer">
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
  </v-card>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
})



const placeholder = 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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
