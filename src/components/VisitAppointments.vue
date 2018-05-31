<template>
  <div class="visit-appointments">
		VisitAppointments, {{ firstName }}, {{ town }}
  </div>
</template>

<script>
import { createHelpers } from 'vuex-map-fields';

const createStateFields = (options) => {
	const { getterType, mutationType } = options;
	const { mapFields } = createHelpers({ getterType, mutationType });
	return mapFields;
};

const mapUserFields = createStateFields({
	getterType: 'getUserField',
	mutationType: 'updateUserField',
});

// const mapAddressesFields = createStateFields({
//   getterType: 'getAddressesField',
//   mutationType: 'updateAddressesField',
// });

// const { mapFields } = createHelpers({
//   getterType: 'getUserField',
//   mutationType: 'updateUserField',
// });

export default {
  name: 'VisitAppointments',
  props: ['name'],
  // components: { Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    ...mapUserFields([
      'firstName',
      'lastName',
    ]),
		town: function() { return this.$store.getters.getAddresses[0].town; },
  },
  methods: {
    junk: function() {
		},
  },
  sockets:{
    "VisitAppointments:blah": function(data){
		  console.log('VisitAppointments:blah', data);
			this.$socket.emit('VisitAppointments:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('VisitAppointments:activate', (data) => {
		  console.log('VisitAppointments:blah', data);
			// const data = this.$store.getters.state;
			// this.$store.commit('setState', data);
			window.Event.$emit('VisitAppointments:activated', {msg: 'done'});
		});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

