import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index'
import App from './App.vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import './style.css'

createApp(App).use(createPinia()).use(router).use(Vant).mount('#app')
