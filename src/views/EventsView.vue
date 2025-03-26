<template>
  <div class="events-view">
    <h1>Events</h1>
    <div class="events-list">
      <EventCard
        v-for="(event, index) in events"
        :key="index"
        :event="event"
      />
    </div>
  </div>
</template>

<script>
import EventCard from '@/components/EventCard.vue'

export default {
  name: 'EventsView',
  components: {
    EventCard
  },
  data() {
    return {
      events: [
        { id: 1, title: 'Event One', description: 'Details about Event One' },
        { id: 2, title: 'Event Two', description: 'Details about Event Two' },
        { id: 3, title: 'Event Three', description: 'Details about Event Three' }
      ]
    }
  }
}
</script>

<style scoped>
.events-view {
  padding: 16px;
}

.events-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
