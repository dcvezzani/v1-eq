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


    <div class="columns member-list">
      <div class="column">
        <autocomplete ref="autocomplete" :source="members" @results="filterList" @close="updateMemberView" @enter="updateMemberView"></autocomplete>

        <div class="controls is-left">
          <a @click="selectAllMembers" href="#">Select All</a> | 
          <a @click="unselectAllMembers" href="#">Select None</a> 
        </div>

        <ul v-if="filteredMembers().length > 0">
          <li class="is-left">{{filteredMemberIds.length}} members loaded</li>
          <Member v-for="member in filteredMembers()" :key="member.id" class="is-left" :member="member"></Member>
        </ul>

        <ul v-else>
          <li class="is-left">{{unselectedMembers().length}} members loaded</li>
          <Member v-for="member in unselectedMembers()" :key="member.id" class="is-left" :member="member"></Member>
        </ul>
      </div>

      <div v-show="newRecords.length > 0" class="column">
        <p>{{ newRecords.length }} new records <span v-if="newRecords.length > 0">| <a @click="importMembers" href="#">Import</a></span></p>
        <p class="import-error">{{ messages.import }}</p>
        <pre class="formattedJson">{{ newRecords }}</pre>
      </div>

      <div v-show="removedIds.length > 0" class="column">
        <p>{{ removedIds.length }} removed records <span v-if="removedIds.length > 0">| <a @click="archiveMembers" href="#">Archive</a></span></p>
        <p class="import-error">{{ messages.archive }}</p>
        <pre class="formattedJson">{{ removedIds }}</pre>
      </div>

      <div v-show="selectedMemberIds.length > 0" class="column">
        <ul>
          <li v-show="selectedMemberIds.length > 0" class="is-left">{{selectedMemberIds.length}} members selected</li>
          <Member v-for="member in selectedMembers()" :key="member.id" class="is-left" :member="member"></Member>
        </ul>
      
        <pre class="formattedJson" style="display: none">{{ members.filter(m => selectedMemberIds.includes(m.id)).map(m => m.name) }}</pre>
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
    selectedMembers: function() {
      return this.members.filter(m => this.selectedMemberIds.includes(m.id));
		},
    unselectedMembers: function() {
      return this.members.filter(m => !m.selected);
		},
    junk: function() {
		},
    fetchMembers: function(refresh = true) {
			this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand), refresh});
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
    selectMember: function(member) {
      if(this.selectedMemberIds.indexOf(member.id) === -1) {
        this.selectedMemberIds.push(member.id);
        member.selected = true;
        setTimeout(() => window.Event.$emit('Member:viewUpdate'), 50);
      }
    }, 
    unselectMember: function(member) {
      if(this.selectedMemberIds.indexOf(member.id) !== -1) {
        const idIdx = this.selectedMemberIds.indexOf(member.id);

        this.selectedMemberIds.splice(idIdx, 1);
        member.selected = false;
        setTimeout(() => window.Event.$emit('Member:viewUpdate'), 50);
      }
    }, 
    selectAllMembers: function() {
      const memberIds = this.members.map(m => m.id);

      if (this.filteredMemberIds.length === 0) {
        this.selectedMemberIds = memberIds;
        this.members.forEach(m => m.selected = true);

      } else {
        this.filteredMemberIds.forEach(filteredMemberId => {
          const mIdx = memberIds.indexOf(filteredMemberId);
          const member = this.members[mIdx];
          if( !this.selectedMemberIds.includes(member.id) ){
            this.selectedMemberIds.push(member.id);
          }
          member.selected = true;
        });
      }

      this.filteredMemberIds = [];
      document.querySelector('.autocomplete input').focus();
      setTimeout(() => window.Event.$emit('Member:viewUpdate'), 50);
    }, 
    unselectAllMembers: function() {
      const memberIds = this.members.map(m => m.id);

      if (this.filteredMemberIds.length === 0) {
        this.selectedMemberIds = [];
        this.members.forEach(m => m.selected = false);

      } else {
        this.filteredMemberIds.forEach(filteredMemberId => {
          const mIdx = memberIds.indexOf(filteredMemberId);
          const member = this.members[mIdx];
          const smIdx = this.selectedMemberIds.indexOf(member.id);
          if( smIdx > -1 ){
            this.selectedMemberIds.splice(smIdx, 1);
          }
          member.selected = false;
        });
      }

      this.filteredMemberIds = [];
      document.querySelector('.autocomplete input').focus();
      setTimeout(() => window.Event.$emit('Member:viewUpdate'), 50);
    }, 
    updateMemberView: function() {
      window.Event.$emit('Member:viewUpdate');
    }, 
  },
  sockets:{
    "Members:blah": function(data){
		  console.log('Members:blah', data);
			this.$socket.emit('Members:blah', {msg: 'bleh'});
    },
    "db:members:import:done": function(data){
      this.fetchMembers(false);
      
      setTimeout(() => this.messages.import = null, 3000);
      if (data.err) {
        this.messages.import = JSON.stringify(data.err);
      } else {
        this.messages.import = `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`;
      }
		  console.log('db:members:import:done', data);
    },
    "db:members:archive:done": function(data){
      setTimeout(() => this.messages.archive = null, 3000);
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
