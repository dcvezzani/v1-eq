<template>
  <div class="ward-members container">
    <div class="field">
      <label class="label">Manage Ward Members</label>
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
    
    <p class="fetched-message">{{ messages.fetched }}</p>
    
    <div class="member-lists">
      <div class="columns">
        <div v-show="true || newRecords.length > 0" class="column">
          <p>{{ newRecords.length }} new records <span v-if="newRecords.length > 0">| <a @click="importMembers">Import</a></span></p>
          <p class="import-error">{{ messages.import }}</p>
          <pre class="formattedJson">{{ newRecords }}</pre>
        </div>

        <div v-show="true || removedIds.length > 0" class="column">
          <p>{{ removedIds.length }} removed records <span v-if="removedIds.length > 0">| <a @click="archiveMembers">Archive</a></span></p>
          <p class="import-error">{{ messages.archive }}</p>
          <pre class="formattedJson">{{ removedIds }}</pre>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <MemberList :members="unselectedMembers" listName="unselectedMembers" memberName="coupleName" @changeMode="changeMode" @moveMembers="moveMembers"></MemberList>
        </div>
        <div class="column">
          <MemberList :members="selectedMembers" listName="selectedMembers" memberName="coupleName" @changeMode="changeMode" @moveMembers="moveMembers"></MemberList>
        </div>
      </div>
      
    </div>
    
  </div>
</template>

<script>
import MemberList from '@/components/members/MemberList';

export default {
  name: 'WardMembers',
  props: ['name'],
  components: { MemberList },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fetchCommand: ``,
      members: [],
      newRecords: [],
      removedIds: [],
      messages: {
        actions: null,
        fetched: null,
        import: null,
        archive: null,
      },
      selectedMembers: [],
      unselectedMembers: [],
      lists: {
        unselectedMembers: {sendTo: 'selectedMembers'}, 
        selectedMembers: {sendTo: 'unselectedMembers'}, 
      }, 
      memberName: 'coupleName',
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
    toastMessage: function(type, message, timeout=3000) {
      setTimeout(() => this.messages[type] = null, timeout);
      this.messages[type] = message;
    }, 
    fetchMembers: function(refresh = true) {
      const source = (refresh) ? "lds.org" : "cache or lds.org";
      this.toastMessage('fetched', `Fetching data from ${source}.  Please wait...`)
      this.$socket.emit('sendShellCommand:fetchMemberListSummary', {cmd: btoa(this.fetchCommand), refresh});
		},
    enterListener: function(event) { 
      if (event.code === 'Enter') {
        console.log("enterListener");
        window.Event.$emit('MemberList:Enter');
      }
    }, 
    changeMode: function({listName, mode}) {
      console.log("changeMode", listName, mode);

      if (mode === 'stage') {
        document.addEventListener('keydown', this.enterListener, false);
      } else {
        document.removeEventListener('keydown', this.enterListener, false);
      }
    },
    moveMembers: function({listName, memberIds}) {
      console.log("moveMembers", listName, memberIds);

      let newList = [];
      const finalIdx = Object.keys(this[listName]).length - 1;
      this[listName].map((m, idx) => {
        if (memberIds.includes(m.id)) {
          m.selected = false;
          this[this.lists[listName].sendTo].push(m);
        } else newList.push(m);
      });
      const memberName = this.memberName;
      this[this.lists[listName].sendTo].sort(function(a, b){
        if (a[memberName] < b[memberName]) return -1;
        if (a[memberName] > b[memberName]) return 1;
        return 0;
      });
      this[listName] = newList;
      this.checkedLists = {};
		},
  },
  sockets:{
    "WardMembers:blah": function(data){
		  console.log('WardMembers:blah', data);
			this.$socket.emit('WardMembers:blah', {msg: 'bleh'});
    },
    "sendShellCommand:fetchMemberListSummary:done": function(data){
		  console.log('sendShellCommand:fetchMemberListSummary:done', data);
      if (data.err) return console.error(data.err);
      // this.members = JSON.parse(data.json);
      this.members = data.members;
      // this.newRecords = data.newRecords || [];
      // this.removedIds = data.removedIds || [];

      // const diffRecordsLength = this.newRecords.length + this.removedIds.length;
      // this.toastMessage('fetched', `Successful fetch.  ${(diffRecordsLength === 0) ? 'Local records are already synched.' : 'Updates found.'}`);
      this.toastMessage('fetched', `Successful fetch`);

      this.unselectedMembers = this.members;
			window.Event.$emit('MemberList:update');
    },
  },
  mounted () {
		window.Event.$on('WardMembers:activate', (data) => {
		  console.log('WardMembers:blah', data);
			window.Event.$emit('WardMembers:activated', {msg: 'done'});
		});

		this.$socket.emit('sendShellCommand:fetchMemberListSummary', {cmd: btoa(this.fetchCommand)});
    
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

