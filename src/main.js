import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import keycloak, { initKeycloak } from './keycloak'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })

// 1) Maak de app *klaar* (maar niet mounten)
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)

// 2) Init Keycloak, dan pas mounten
initKeycloak()
  .then(() => {
    // beschikbaar maken in je components
    app.config.globalProperties.$keycloak = keycloak
    app.mount('#app')
  })
  .catch(err => console.error('Keycloak init failed:', err))
