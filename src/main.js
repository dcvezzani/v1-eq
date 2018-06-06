// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import io from 'socket.io-client';

require('./assets/sass/main.scss');

import VueSocketio from 'vue-socket.io';
Vue.use(VueSocketio, io('http://localhost:3000', { path: '/io-eq-v1'}));

window.Event = new Vue();

Vue.config.productionTip = false

import store from './store';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
