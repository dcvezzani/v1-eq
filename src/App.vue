<template>
  <div id="app">
    <!-- img src="./assets/logo.png" -->

    <div class="router-links">
      <router-link to="/">FormatVisitRequest</router-link> |
      <router-link to="/ListMembers">ListMembers</router-link> |
      <router-link to="/ListRoles">ListRoles</router-link> |
      <router-link to="/Members">Members</router-link>
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
</style>
