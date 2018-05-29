<template>
  <div class="visit-appointments">
		VisitAppointments
  </div>
</template>

<script>
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

