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

    <div class="columns">
      <div class="column">
        <ul>
          <li v-for="member in members" :key="member.id">{{ member.name }}</li>
        </ul>
      </div>
      <div class="column">
        <p>{{ newIds.length }} new records <span v-if="newIds.length > 0">| <a @click="importMembers" href="#">Import</a></span></p>
        <pre class="formattedJson">{{ newIds }}</pre>
      </div>
      <div class="column">
        <p>{{ removedIds.length }} removed records <span v-if="removedIds.length > 0">| <a href="#">Archive</a></span></p>
        <pre class="formaedJson">{{ removedIds }}</pre>
      </div>
    </div>

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
      newIds: [],
      removedIds: [],
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
    importMembers: function() {
			this.$socket.emit('db:members:import', {members: this.members, offices: this.offices, importIds: this.newIds});
    }
  },
  sockets:{
    "Members:blah": function(data){
		  console.log('Members:blah', data);
			this.$socket.emit('Members:blah', {msg: 'bleh'});
    },
    "db:members:import:done": function(data){
		  console.log('db:members:import:done', data);
    },
    "sendShellCommand:fetchMembers:done": function(data){
		  console.log('sendShellCommand:fetchMembers:done', data);
      if (data.err) return console.error(data.err);
      const parsedData = JSON.parse(data.stdout)[0];
      this.members = parsedData.members;
      this.offices = parsedData.filterOffices;
      this.newIds = data.newIds || [];
      this.removedIds = data.removedIds || [];
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

