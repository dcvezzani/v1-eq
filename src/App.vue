<template>
  <div id="app">
    <!-- img src="./assets/logo.png" -->

    <div class="router-links-container" style="display: block;">
      <div class="router-links">
        <router-link to="/">FormatVisitRequest</router-link> |
        <router-link to="/ListMembers">ListMembers</router-link> |
        <router-link to="/ListRoles">ListRoles</router-link>
      </div>
      <div class="router-links">
        <router-link to="/Members">Members</router-link> | 
        <router-link to="/Families">Families</router-link> | 
        <router-link to="/Yearbook">Yearbook</router-link> |
        <router-link to="/FamilyVisits">FamilyVisits</router-link> |
        <router-link to="/Chairs">Chairs</router-link>
      </div>
      <div class="router-links">
        <router-link to="/WardMembers">WardMembers</router-link> | 
        <router-link to="/Districts">Districts</router-link>
      </div>
    </div>

    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App', 
  sockets:{
    connect: function(){
      console.log('socket connected')
      this.$socket.emit('join', {server: true});
    },
    joined: function(msg){
      console.log('socket-in:joined:', msg);
    },
	},
	mounted () {
	},
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.members ul.autocomplete__results {
  display: none;
}
.is-left, 
.formattedJson {
  text-align: left;
}
.member-list {
  margin-top: 1em;
  background-color: hsla(218, 11%, 72%, 0.1);
  border-radius: 3px;
}
pre {
  background-color: hsla(218, 11%, 72%, 0.3);
  border-radius: 3px;
}

</style>
