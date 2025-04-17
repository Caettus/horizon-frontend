<!-- src/components/FeaturesSection.vue -->
<template>
  <v-container class="py-16">
    <v-row justify="center" class="text-center">
      <v-col cols="12" md="4" v-for="feature in features" :key="feature.title">
        <v-icon size="64" class="mb-4">{{ feature.icon }}</v-icon>
        <h3 class="text-h5 font-weight-medium mb-2">{{ feature.title }}</h3>
        <p class="text-body-1">{{ feature.desc }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const features = [
  {
    icon: 'mdi-account-group-outline',
    title: 'Nieuwe Connecties',
    desc: 'Ontmoet gelijkgestemden door events te ontdekken die bij jou passen.',
  },
  {
    icon: 'mdi-calendar-edit',
    title: 'Eenvoudig Organiseren',
    desc: 'Creëer, beheers en promoot je bijeenkomsten in een paar klikken.',
  },
  {
    icon: 'mdi-chart-line',
    title: 'Inzicht & Statistieken',
    desc: 'Bekijk deelnemersstatistieken en groei je community.',
  },
]
</script>
