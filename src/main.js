import Vue from 'vue'
import App from './App.vue'
import 'bootstrap';
import {BootstrapVue} from 'bootstrap-vue';


Vue.config.productionTip = false
Vue.use(BootstrapVue);
import 'bootstrap/dist/css/bootstrap.css'
Vue.prototype.$main_path = 'http://localhost:1017'

new Vue({
  render: h => h(App),
}).$mount('#app')

