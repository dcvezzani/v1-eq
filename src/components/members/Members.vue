<template>
  <div class="members container">
		Members

    <div class="field">
      <label class="label">Message</label>
      <div class="control">
        <textarea v-model="fetchCommand" class="textarea" placeholder="Textarea"></textarea>
      </div>
    </div>

    <div class="field is-grouped is-grouped-centered">
      <div class="control">
        <button @click="fetchMembers" class="button is-link">Fetch</button>
      </div>
      <div class="control">
        <button class="button is-text">Cancel</button>
      </div>
    </div>

    <div v-if="false" class="columns">
      <div class="column">
        <pre class="formattedJson">{{ offices }}</pre>
      </div>
      <div class="column">
        <pre class="formattedJson">{{ members }}</pre>
      </div>
    </div>

    <ul>
      <li v-for="member in members" :key="member.id">{{ member.name }}</li>
    </ul>

  </div>
</template>

<script>
export default {
  name: 'Members',
  props: ['name'],
  // components: { Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fetchCommand: '',
      members: [],
      offices: [],
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
    fetchMembers: function() {
			this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand), refresh: true});
		},
  },
  sockets:{
    "Members:blah": function(data){
		  console.log('Members:blah', data);
			this.$socket.emit('Members:blah', {msg: 'bleh'});
    },
    "sendShellCommand:fetchMembers:done": function(data){
		  console.log('sendShellCommand:fetchMembers:done', data);
      if (data.err) return console.error(data.err);
      console.log("data.stdout", data.stdout);
      this.members = JSON.parse(data.stdout)[0].members;
      this.offices = JSON.parse(data.stdout)[0].filterOffices;
    },
  },
  mounted () {
		window.Event.$on('Members:activate', (data) => {
		  console.log('Members:blah', data);
			window.Event.$emit('Members:activated', {msg: 'done'});
		});

		this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand)});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.formattedJson {
  text-align: left;
}
</style>

