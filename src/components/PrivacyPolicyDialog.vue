<template>
  <v-dialog :model-value="modelValue" @update:model-value="handleUpdate" max-width="600">
    <v-card>
      <v-card-title class="text-h6">Privacyreglement</v-card-title>
      <v-card-text>
        <p>
          Wij hechten veel waarde aan uw privacy. Deze mockup beschrijft hoe een
          echt platform persoonsgegevens zou kunnen verwerken. Denk aan het
          verzamelen van minimale accountgegevens en het gebruik van cookies voor
          een betere gebruikservaring. U kunt in het privacy instellingen scherm
          aangeven welke gegevens u wilt delen.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="closeDialog">Sluiten</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  modelValue: { type: Boolean, required: true },
});

const emit = defineEmits(['update:modelValue']);

function handleUpdate(val) {
  emit('update:modelValue', val);
}

function closeDialog() {
  emit('update:modelValue', false);
}
</script>
