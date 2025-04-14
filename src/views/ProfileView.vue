<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title>
            Profile
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    Name: {{ testMessage }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    Email: {{ testMessage }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary">Edit Profile</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: "ProfileView",
  data() {
    return {
      testMessage: ''
    };
  },
  mounted() {
    axios.get('/api/users/test')
      .then(response => {
        this.testMessage = response.data;
      })
      .catch(error => {
        console.error("Error fetching test message:", error);
        this.testMessage = "Failed to load";
      });
  }
};
</script>


<style scoped>
/* Add your custom styles here */
</style>
