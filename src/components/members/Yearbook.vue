<template>
  <div class="yearbook">
    <h2 class="title"> Vineyard 1st Ward EQ Roster </h2>
    <p>As of {{currentDate}}</p>

    <ul v-if="members.length > 0" class="yearbook">
      <li v-for="member in members" :key="member.id"> <div class="member"> <div class="photo" :style="bgPhoto(member)"></div> 
      <img :src="memberPhoto(member)" class="member" alt="">
      <p>{{member.name.slice(0,18)}}</p><p class="member-id">{{member.id}}</p> </div> </li>
      
    </ul>

  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'Yearbook',
  props: ['name'],
  // components: { Junk },
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
    currentDate: function() {
			return moment().format('MMM DD, YYYY');
		},
  },
  methods: {
    junk: function() {
		},
    memberPhoto: function(member) {
      return `http://localhost:8095/photos/${member.id}`;
		},
    bgPhoto: function(member) {
			return {display: 'none', 'background-image': `url(http://localhost:8095/photos/${member.id})`}
		},
  },
  sockets:{
    "Yearbook:blah": function(data){
		  console.log('Yearbook:blah', data);
			this.$socket.emit('Yearbook:blah', {msg: 'bleh'});
    },
    "db:members:fetchFamilies:done": function({ responsePayload }){
		  console.log('db:members:fetchFamilies:done', responsePayload);
      this.members = responsePayload;
    },
  },
  mounted () {
		window.Event.$on('Yearbook:activate', (data) => {
		  console.log('Yearbook:blah', data);
			window.Event.$emit('Yearbook:activated', {msg: 'done'});
		});
		this.$socket.emit('db:members:fetchFamilies', {});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.yearbook li {
display: inline-block;
}
.yearbook .member {
  width: 250px;
  height: 250px;
  width: 150px;
  height: 150px;
  margin: 1em;
}
.yearbook .member .photo {
    width: 250px;
    height: 250px;
    background-size: 100%;
    background-repeat: no-repeat;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
}
h2.title {
  font-size: 24pt;
  font-weight: bold;
}
</style>

