<template>
  <div class="list-members">
		ListMembers

		<Member v-for="member in members" :key="member.id" :attrs="member"></Member>
  </div>
</template>

<script>
import Member from '@/components/Member';
import request from 'request';
// const USERS_INDEX = 'http://localhost:3000/users/?like=Ahlmann';
// const USERS_INDEX = 'http://localhost:3000/users/?groups[]=eq&groups[]=rs';
const USERS_INDEX = 'http://localhost:3000/users/';

export default {
  components: { Member,},
  name: 'ListMembers',
  props: ['name'],
  // components: { Member, Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			members: [],
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
    "ListMembers:blah": function(data){
		  console.log('ListMembers:blah', data);
			this.$socket.emit('ListMembers:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('ListMembers:activate', (data) => {
		  console.log('ListMembers:blah', data);
			window.Event.$emit('ListMembers:activated', {msg: 'done'});
		});

		request(USERS_INDEX, (err, response, body) => {
			if (err) return console.log(err);
			this.members = JSON.parse(body).members;
		});
		
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
