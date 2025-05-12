<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="handleUpdate"
    persistent
    max-width="600"
  >
    <v-card v-if="event">
      <v-img :src="event.image || placeholder" height="250" cover />

      <v-card-title class="text-h6">{{ event.title }}</v-card-title>
      <v-card-subtitle>
        <span v-if="event.date">{{ event.date }}</span>
        <span v-if="event.location"> • {{ event.location }}</span>
      </v-card-subtitle>

      <v-card-text>
        <p>{{ event.description }}</p>
        <div class="d-flex flex-wrap">
          <v-chip v-if="event.category" class="ma-1" color="primary" outlined small>
            {{ event.category }}
          </v-chip>
          <v-chip
            v-for="tag in event.tags || []"
            :key="tag"
            class="ma-1"
            small
          >
            {{ tag }}
          </v-chip>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" @click="handleClose">Sluiten</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  event: { type: Object, required: false, default: null },
})

const emit = defineEmits(['update:modelValue'])

const handleUpdate = (val) => emit('update:modelValue', val)
const handleClose = () => emit('update:modelValue', false)

const placeholder =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
</script>
