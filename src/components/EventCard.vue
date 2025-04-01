<template>
  <div class="event-card">
    <img v-if="image" :src="image" alt="event image" class="event-image" />
    <div class="event-content">
      <h2 class="event-title">{{ title }}</h2>
      <div class="event-date">{{ date }}</div>
      <p class="event-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Event Title',
  },
  date: {
    type: String,
    default: 'Event Date',
  },
  description: {
    type: String,
    default: 'Event Description',
  },
  image: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.event-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
  max-width: 350px;
}
.event-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.event-content {
  padding: 16px;
}
.event-title {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}
.event-date {
  font-size: 0.9em;
  color: #777;
  margin: 4px 0 12px;
}
.event-description {
  margin: 0;
  color: #555;
  line-height: 1.4em;
}
</style>
