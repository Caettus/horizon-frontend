<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-4">
          <v-card-title class="headline grey--text text--darken-2" justify="center">
            Profiel
          </v-card-title>

          <v-divider class="my-3"></v-divider>

          <v-card-text>
            <v-row align="center">
              <v-col cols="auto">
                <v-avatar size="80">
                  <!-- Vervang de src door een dynamische user-avatar indien beschikbaar -->
                  <img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="Avatar" />
                </v-avatar>
              </v-col>
              <v-col>
                <div class="title mb-1">
                  Naam: {{ user.username || 'Niet beschikbaar' }}
                </div>
                <div class="subtitle-2 grey--text">
                  Email: {{ user.email || 'Niet beschikbaar' }}
                </div>
              </v-col>
            </v-row>

            <!-- Eventueel extra info -->
            <v-alert v-if="errorMessage" type="error" dense text>
              {{ errorMessage }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="editProfile">
              Bewerk Profiel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfileView",
  data() {
    return {
      user: {
        name: "",
        email: ""
      },
      errorMessage: ""
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await axios.get("/api/users/1");
        this.user = {
          username: response.data.username || "Onbekend",
          email: response.data.email || "Onbekend"
        };
      } catch (error) {
        console.error("Fout bij laden van profielgegevens:", error);
        this.errorMessage = "Fout bij het laden van het profiel";
      }
    },
    editProfile() {
      console.log("Bewerk profiel knop ingedrukt");
    }
  }
};
</script>

<style scoped>
.v-card-title {
  text-align: center;
}
</style>
