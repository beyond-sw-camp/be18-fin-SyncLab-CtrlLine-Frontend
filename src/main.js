import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createPinia } from 'pinia';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import ganttastic from '@infectoone/vue-ganttastic';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(ganttastic);
// router 추가 필요

app.mount('#app');
