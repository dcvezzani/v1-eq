<template>
  <div class="members container">

    <div class="field">
      <label class="label">Manage Members</label>
      <p class="help is-left">Copy and paste a cURL from Chrome Dev Tools (Network tab) from lds.org (Leader tools > Organizations > EQ)</p>
      <div class="control">
        <textarea v-model="fetchCommand" class="textarea" placeholder="Textarea"></textarea>
      </div>
    </div>

    <div class="field is-grouped is-grouped-centered">
      <div class="control">
        <button @click="fetchMembers" class="button is-link">Fetch</button>
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

    <autocomplete :source="members" @results="filterList" @close="updateMemberView"></autocomplete>

    <div class="columns member-list">
      <div class="column">
        <div class="controls">
          <a @click="selectAllMembers" href="#">Select All</a> | 
          <a @click="unselectAllMembers" href="#">Select None</a> 
        </div>

        <ul v-if="filteredMembers().length > 0">
          <Member v-for="member in filteredMembers()" :key="member.id" class="is-left" :member="member"></Member>
        </ul>
        <ul v-else>
          <Member v-for="member in members" :key="member.id" class="is-left" :member="member"></Member>
        </ul>
      </div>
      <div class="column">
        <p>{{ newRecords.length }} new records <span v-if="newRecords.length > 0">| <a @click="importMembers" href="#">Import</a></span></p>
        <p class="import-error">{{ messages.import }}</p>
        <pre class="formattedJson">{{ newRecords }}</pre>
      </div>
      <div class="column">
        <p>{{ removedIds.length }} removed records <span v-if="removedIds.length > 0">| <a @click="archiveMembers" href="#">Archive</a></span></p>
        <p class="import-error">{{ messages.archive }}</p>
        <pre class="formattedJson">{{ removedIds }}</pre>
      </div>
    </div>

  </div>
</template>

<script>
import Member from '@/components/members/Member';
import Autocomplete from 'vuejs-auto-complete'

export default {
  name: 'Members',
  props: ['name'],
  components: { Member, Autocomplete },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fetchCommand: '',
      filteredMemberIds: [],
      selectedMemberIds: [],
      members: [],
      offices: [],
      newRecords: [],
      removedIds: [],
      messages: {
        import: null,
        archive: null,
      },
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    // filteredMembers: function() {
		// 	return this.members.filter(member => this.filteredMemberIds.includes(member.id));
		// },
  },
  methods: {
    filteredMembers: function() {
			return this.members.filter(member => this.filteredMemberIds.includes(member.id));
		},
    junk: function() {
		},
    fetchMembers: function() {
			this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand), refresh: true});
		},
    importMembers: function() {
			this.$socket.emit('db:members:import', {members: this.newRecords, offices: this.offices});
    }, 
    archiveMembers: function() {
			this.$socket.emit('db:members:archive', {memberIds: this.removedIds});
    }, 
    filterList: function(res) {
      this.filteredMemberIds = res.results.map(member => member.id);
    }, 
    selectAllMembers: function() {
      this.filteredMemberIds.map(memberId => {
        const member = this.members.filter(member => member.id === memberId)[0];
        console.log("member", member);
        member.selected = true;

        if(this.selectedMemberIds.indexOf(memberId) === -1) {
          this.selectedMemberIds.push(memberId);
        }
        
        return null;
      });
      
			window.Event.$emit('Member:viewUpdate');
    }, 
    unselectAllMembers: function() {
      this.filteredMemberIds.map(memberId => {
        const member = this.members.filter(member => member.id === memberId)[0];
        member.selected = false;

        if(this.selectedMemberIds.indexOf(memberId) !== -1) {
          const memberIdIndex = this.selectedMemberIds.indexOf(memberId);
          this.selectedMemberIds.splice(memberIdIndex, 1);
        }
        
        return null;
      });

			window.Event.$emit('Member:viewUpdate');
    }, 
    updateMemberView: function() {
      console.log(">>> showAll");
      window.Event.$emit('Member:viewUpdate');
    }, 
  },
  sockets:{
    "Members:blah": function(data){
		  console.log('Members:blah', data);
			this.$socket.emit('Members:blah', {msg: 'bleh'});
    },
    "db:members:import:done": function(data){
      setTimeout(() => this.messages.import == null, 3000);
      if (data.err) {
        this.messages.import = JSON.stringify(data.err);
      } else {
        this.messages.import = `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`;
      }
		  console.log('db:members:import:done', data);
    },
    "db:members:archive:done": function(data){
      setTimeout(() => this.messages.archive == null, 3000);
      if (data.err) {
        this.messages.archive = JSON.stringify(data.err);
      } else {
        this.messages.archive = `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`;
      }
		  console.log('db:members:archive:done', data);
    },
    "sendShellCommand:fetchMembers:done": function(data){
		  console.log('sendShellCommand:fetchMembers:done', data);
      if (data.err) return console.error(data.err);
      const parsedData = JSON.parse(data.stdout)[0];
      this.members = parsedData.members;
      this.offices = parsedData.filterOffices;
      this.newRecords = data.newRecords || [];
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
