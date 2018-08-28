<template>
  <div class="families container">

    <div class="field">
      <label class="label">Manage Families</label>
      <p class="help is-left">Copy and paste a cURL from Chrome Dev Tools (Network tab) from lds.org (Directory)</p>
      <div class="control">
        <textarea v-model="fetchCommand" class="textarea" placeholder="Textarea"></textarea>
      </div>
    </div>

    <div class="field is-grouped is-grouped-centered">
      <div class="control">
        <button @click="fetchFamilies" class="button is-link">Fetch</button>
      </div>
    </div>
      <p class="fetched-message">{{ messages.fetched }}</p>

    <div class="member-lists">
      <div class="columns">
        <div v-show="true || newRecords.length > 0" class="column">
          <p>{{ newRecords.length }} new records <span v-if="newRecords.length > 0">| <a @click="importFamilies">Import</a></span></p>
          <p class="import-error">{{ messages.import }}</p>
          <pre class="formattedJson">{{ newRecords }}</pre>
        </div>

        <div v-show="true || removedIds.length > 0" class="column">
          <p>{{ removedIds.length }} removed records <span v-if="removedIds.length > 0">| <a @click="archiveFamilies">Archive</a></span></p>
          <p class="import-error">{{ messages.archive }}</p>
          <pre class="formattedJson">{{ removedIds }}</pre>
        </div>
      </div>
    
      <div class="columns">
        <div class="column">
          <MemberList :members="selectedFamilies" :memberName="memberName" :memberId="memberId" listName="selectedFamilies" @changeMode="changeMode" @moveMembers="moveFamilies"></MemberList>
        </div>

        <div class="column">
          <MemberList :members="unselectedFamilies" :memberName="memberName" :memberId="memberId" listName="unselectedFamilies" @changeMode="changeMode" @moveMembers="moveFamilies"></MemberList>
          <p class="toast">{{ messages.actions }}</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import MemberList from '@/components/members/MemberList';

export default {
  name: 'Families',
  props: ['name'],
  components: { MemberList },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fetchCommand: '',
      families: [],
      newRecords: [],
      removedIds: [],
      messages: {
        actions: null,
        fetched: null,
        import: null,
        archive: null,
      },
      lists: {
        unselectedFamilies: {sendTo: 'selectedFamilies'}, 
        selectedFamilies: {sendTo: 'unselectedFamilies'}, 
      }, 

      // for MemberList components
      selectedFamilies: [],
      unselectedFamilies: [],
      memberName: 'coupleName',
      memberId: 'headOfHouseIndividualId',
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    familiesById: function() {
			return this.families.reduce((hash, family) => {hash[family.id] = family; return hash}, {});
		},
  },
  methods: {
    junk: function() {
		},

    // for MemberList components
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
    moveFamilies: function({listName, memberIds}) {
      console.log("moveFamilies", listName, memberIds);

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
		},
    fetchFamilies: function(refresh = true) {
      const source = (refresh) ? "lds.org" : "cache or lds.org";
      this.toastMessage('fetched', `Fetching data from ${source}.  Please wait...`)
			this.$socket.emit('sendShellCommand:fetchFamilies', {cmd: btoa(this.fetchCommand), refresh});
		},
    importFamilies: function() {
			this.$socket.emit('db:families:import', {families: this.newRecords, offices: this.offices});
    }, 
    archiveFamilies: function() {
			this.$socket.emit('db:families:archive', {families: this.removedIds});
    }, 
    toastMessage: function(type, message, timeout=3000) {
      setTimeout(() => this.messages[type] = null, timeout);
      this.messages[type] = message;
    }, 
    
  },
  sockets:{
    "db:families:importFamilies:done": function(data){
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`);
      }
		  console.log('db:families:importFamilies:done', data);
    },
    "db:families:import:done": function(data){
      this.fetchFamilies(false);
      
      if (data.err) {
        this.messages.import = JSON.stringify(data.err);
      } else {
        this.toastMessage('import', `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`);
        this.$socket.emit('sendShellCommand:fetchFamilies', {cmd: ''});
      }
		  console.log('db:families:import:done', data);
    },
    "db:families:archive:done": function(data){
      if (data.err) {
        this.messages.archive = JSON.stringify(data.err);
      } else {
        this.toastMessage('archive', `Successful archival; ${JSON.stringify(data.payload).slice(0,100)}...`);
        this.$socket.emit('sendShellCommand:fetchFamilies', {cmd: ''});
      }
		  console.log('db:families:archive:done', data);
    },
    "sendShellCommand:fetchFamilyDetails:done": function(data){
      console.log("sendShellCommand:fetchFamilyDetails:done", data);
    },
    "sendShellCommand:fetchFamilies:done": function(data){
      if (data.err) return console.error(data.err);
      // console.log(">>> data.stdout", data.stdout);
      this.families = JSON.parse(data.stdout);
      this.newRecords = data.newRecords || [];
      this.removedIds = data.removedIds || [];

      const diffRecordsLength = this.newRecords.length + this.removedIds.length;
      this.toastMessage('fetched', `Successful fetch.  ${(diffRecordsLength === 0) ? 'Local records are already synched.' : 'Updates found.'}`);

      this.selectedFamilies = this.families;
			window.Event.$emit('MemberList:update');
    },
  },

  mounted () {
		this.$socket.emit('sendShellCommand:fetchFamilies', {cmd: btoa(this.fetchCommand)});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

