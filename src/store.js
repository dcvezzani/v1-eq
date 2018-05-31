import Vue from 'vue';
import Vuex from 'vuex';

import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      firstName: 'Dave',
      lastName: '',
    },
    addresses: [
      {
        town: 'Vineyard',
      },
    ],
  },
  getters: {
    getField,
    getUserField(state) {
      return getField(state.user);
    },
		getAddresses: state => state.addresses,
    // getAddressesField(state) {
    //   return getField(state.addresses);
    // },
		// getUserFirstName: state => state.user.firstName, 
  },
  mutations: {
    updateField,
    updateUserField(state, field) {
      updateField(state.user, field);
    },
    // updateAddressesField(state, field) {
    //   updateField(state.addresses, field);
    // },
  },
});

