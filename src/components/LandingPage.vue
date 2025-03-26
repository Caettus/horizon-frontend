<template>
  <!-- Vuetify container om je content te centreren -->
  <v-container class="mt-10">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- Een simpele card als 'welkomstblok' -->
        <v-card>
          <v-card-title class="text-h5">
            Welkom bij Horizon
          </v-card-title>

          <v-card-text>
            <p>
              Horizon is jouw startpunt voor het ontdekken en organiseren
              van leuke evenementen, zowel online als offline!
            </p>
            <p>
              Met deze app kun je eenvoudig nieuwe mensen ontmoeten,
              evenementen beheren en je eigen bijeenkomsten promoten.
            </p>
          </v-card-text>

          <v-card-actions>
            <!-- Voorbeeldknoppen die je kunt koppelen aan routes of functionaliteit -->
            <v-btn color="primary" @click="handleLogin">
              Log in
            </v-btn>
            <v-btn color="secondary" text @click="handleSignUp">
              Registreer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
function handleLogin() {
  // Hier kun je bijvoorbeeld: this.$router.push('/login')
  console.log('Ga naar inlogscherm!')
}

function handleSignUp() {
  console.log('Ga naar registratiepagina!')
}
</script>

<style scoped>
.mt-10 {
  margin-top: 40px; /* Een beetje space boven */
}
</style>
