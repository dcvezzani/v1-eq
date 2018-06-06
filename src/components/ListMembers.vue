<template>
  <div class="container list-members">
		<p>Members</p>

		<autocomplete
			ref="memberName"
			source="http://localhost:3000/users/?like="
			placeholder="Type member name"
			results-property="members"
			results-display="name"
			results-value="id"
			@selected="memberNameSelected"
			@input="memberNameInput"
			@clear="clearMemberName"
			>
		</autocomplete>

		<!-- Member v-for="member in members" :key="member.id" :attrs="member"></Member -->
		<MemberFullDetails v-show="member !== null" :data="member"></MemberFullDetails>
  </div>
</template>

<script>
import MemberFullDetails from '@/components/MemberFullDetails';
import Member from '@/components/Member';
import request from 'request';
// const USERS_INDEX = 'http://localhost:3000/users/?like=Ahlmann';
// const USERS_INDEX = 'http://localhost:3000/users/?groups[]=eq&groups[]=rs';
const USERS_INDEX = 'http://localhost:3000/users/';
import Autocomplete from 'vuejs-auto-complete'
import moment from 'moment';

export default {
  components: { MemberFullDetails, Member, Autocomplete, },
  name: 'ListMembers',
  props: ['name'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			members: [],
			member: null,
			memberId: null,
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
    memberNameSelected: function(data) {
			let memberData = data.selectedObject;
			memberData.address = memberData.address.replace(/<br \/>/, ', ');
			// memberData.birthDate = moment(memberData.birthDate, 'YYYYMMDD').format("DD MMM YYYY");
			memberData.birthDate = moment(memberData.birthDate, 'YYYYMMDD').format("DD MMM");
			this.member = memberData;
		},
    memberNameInput: function(id) {
			this.memberId = id;
		},
    clearMemberName: function(id) {
			this.member = null;
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
