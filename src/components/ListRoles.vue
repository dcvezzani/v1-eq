<template>
  <div class="list-roles">
		ListRoles
		<Role v-for="role in roles" :key="role.id" :attrs="role"></Role>
  </div>
</template>

<script>
import Role from '@/components/Role';
import request from 'request';
const ROLES_INDEX = 'http://localhost:3000/roles/';

export default {
  components: { Role,},
  name: 'ListRoles',
  props: ['name'],
  // components: { Role, Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			roles: [],
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
    "ListRoles:blah": function(data){
		  console.log('ListRoles:blah', data);
			this.$socket.emit('ListRoles:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('ListRoles:activate', (data) => {
		  console.log('ListRoles:blah', data);
			window.Event.$emit('ListRoles:activated', {msg: 'done'});
		});

		request(ROLES_INDEX, (err, response, body) => {
			if (err) return console.log(err);
			// console.log("JSON.parse(body).rows", body, JSON.parse(body).rows);
			this.roles = JSON.parse(body).rows;
		});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
