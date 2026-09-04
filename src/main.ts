import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'

import App from './App.vue'
import router from './router'
import BaseButton from './components/common/BaseButton.vue'
import BaseModal from './components/common/BaseModal.vue'
import { firebaseApp } from './config/firebase'
import 'country-flag-icons/3x2/flags.css'
import './style.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

app.component('BaseButton', BaseButton)
app.component('AppButton', BaseButton)
app.component('BaseModal', BaseModal)

app.use(VueFire, {
  firebaseApp,
  modules: [
    VueFireAuth(),
  ],
})

app.mount('#app')

