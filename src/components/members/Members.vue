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
      <p class="fetched-message">{{ messages.fetched }}</p>

    <div v-if="false" class="columns">
      <div class="column">
        <pre class="formattedJson">{{ offices }}</pre>
      </div>
      <div class="column">
        <pre class="formattedJson">{{ members }}</pre>
      </div>
    </div>


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
          <MemberList :members="unselectedMembers" listName="unselectedMembers" @changeMode="changeMode" @moveMembers="moveMembers"></MemberList>
        </div>

        <div class="column">
          <MemberList :members="selectedMembers" listName="selectedMembers" @changeMode="changeMode" @moveMembers="moveMembers"></MemberList>
          <button @click="createNotes" class="button is-link">Create Notes</button>
          <button @click="fetchFamilyDetails" class="button is-link">Fetch Details</button>
          <button @click="importFamilies" class="button is-link">Import Families</button>
          <p class="toast">{{ messages.actions }}</p>

          <div v-show="memberPhoto" class="memberPhoto"><img :src="memberPhoto" alt=""></div>
          <div v-for="photo in memberPhotos" class="memberPhoto"><img :src="photo" alt=""></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MemberList from '@/components/members/MemberList';
import { createNotes } from '@/fetch';
// const randomIdentifier = () => {
//   return Math.random().toString(36).replace('0.', '');
// }
export default {
  name: 'Members',
  props: ['name'],
  components: { MemberList },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fetchCommand: '',
      members: [],
      offices: [],
      newRecords: [],
      removedIds: [],
      messages: {
        actions: null,
        fetched: null,
        import: null,
        archive: null,
      },
      lists: {
        unselectedMembers: {sendTo: 'selectedMembers'}, 
        selectedMembers: {sendTo: 'unselectedMembers'}, 
      }, 

      // for MemberList components
      selectedMembers: [],
      unselectedMembers: [],
      memberName: 'name',
      memberPhoto: '',
      memberPhotos: [],
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    membersById: function() {
			return this.members.reduce((hash, member) => {hash[member.id] = member; return hash}, {});
		},
  },
  methods: {
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
		},

    createNotes: function() {
      createNotes('Vezzani, David & Juventa', (err, res) => {
        console.log("createNotes", err, res);
      });
    },
    fetchMembers: function(refresh = true) {
      const source = (refresh) ? "lds.org" : "cache or lds.org";
      this.toastMessage('fetched', `Fetching data from ${source}.  Please wait...`)
			this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand), refresh});
		},
    fetchFamilyDetails: function(event, refresh = true) {
      console.log("this.selectedMembers", this.selectedMembers[0].id);
      // 3694966261, 3676616600
      if (this.selectedMembers[0]) {
        this.$socket.emit('sendShellCommand:fetchFamilyDetails', {cmd: btoa(this.fetchCommand), memberId: this.selectedMembers[0].id, refresh: (refresh === true)});
      }
		},
    importFamilies: function() {
			this.$socket.emit('db:members:importFamilies', {families: []});
    }, 
    importMembers: function() {
			this.$socket.emit('db:members:import', {members: this.newRecords, offices: this.offices});
    }, 
    archiveMembers: function() {
			this.$socket.emit('db:members:archive', {memberIds: this.removedIds});
    }, 
    toastMessage: function(type, message, timeout=3000) {
      setTimeout(() => this.messages[type] = null, timeout);
      this.messages[type] = message;
    }, 
  },
  sockets:{
    "db:members:importFamilies:done": function(data){
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`);
      }
		  console.log('db:members:importFamilies:done', data);
    },
    "db:members:import:done": function(data){
      this.fetchMembers(false);
      
      if (data.err) {
        this.messages.import = JSON.stringify(data.err);
      } else {
        this.toastMessage('import', `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`);
        this.$socket.emit('sendShellCommand:fetchMembers', {cmd: ''});
      }
		  console.log('db:members:import:done', data);
    },
    "db:members:archive:done": function(data){
      if (data.err) {
        this.messages.archive = JSON.stringify(data.err);
      } else {
        this.toastMessage('archive', `Successful archival; ${JSON.stringify(data.payload).slice(0,100)}...`);
        this.$socket.emit('sendShellCommand:fetchMembers', {cmd: ''});
      }
		  console.log('db:members:archive:done', data);
    },
    "sendShellCommand:fetchFamilyDetails:done": function(data){
      console.log("sendShellCommand:fetchFamilyDetails:done", data);
      const memberDetails = JSON.parse(data.json);
      console.log("memberDetails", memberDetails);

      this.memberPhotos.length = 0;
      if (memberDetails.headOfHousehold) this.memberPhotos.push(memberDetails.headOfHousehold.photoUrl);
      if (memberDetails.spouse) this.memberPhotos.push(memberDetails.spouse.photoUrl);
      if (memberDetails.householdInfo) this.memberPhotos.push(memberDetails.householdInfo.photoUrl);
      memberDetails.otherHouseholdMembers.forEach(other => this.memberPhotos.push(other.photoUrl));

      // this.memberPhoto = (memberDetails.headOfHousehold.individualId === data.memberId) ? memberDetails.headOfHousehold.photoUrl : memberDetails.spouse.photoUrl;
    },
    "sendShellCommand:fetchMembers:done": function(data){
      if (data.err) return console.error(data.err);
      const parsedData = JSON.parse(data.stdout)[0];
      this.members = parsedData.members;
      this.offices = parsedData.filterOffices;
      this.newRecords = data.newRecords || [];
      this.removedIds = data.removedIds || [];

      const diffRecordsLength = this.newRecords.length + this.removedIds.length;
      this.toastMessage('fetched', `Successful fetch.  ${(diffRecordsLength === 0) ? 'Local records are already synched.' : 'Updates found.'}`);

      this.unselectedMembers = this.members;
			window.Event.$emit('MemberList:update');
    },
  },
  mounted () {
		this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand)});
  },
  watch: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.memberPhoto {
  width: 150px;
  display: inline-block;
  margin: 5px;
}
</style>
