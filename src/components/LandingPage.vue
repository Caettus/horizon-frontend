<!-- src/views/LandingPage.vue -->
<template>
  <div>
    <!-- Hero Section using the parallax for visual pop -->
    <HeroSection />

    <!-- Additional Content under the hero section -->
    <v-container class="my-10">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card outlined>
            <v-card-text>
              <p>
                Horizon is jouw startpunt voor het ontdekken en organiseren van leuke evenementen,
                zowel online als offline!
              </p>
              <p>
                Met deze app kun je eenvoudig nieuwe mensen ontmoeten, evenementen beheren en je eigen
                bijeenkomsten promoten.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import HeroSection from '@/components/HeroSection.vue'
</script>
