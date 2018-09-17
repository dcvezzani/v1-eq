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
      <div class="control">
        <button @click="updateContactInfo" class="button is-link">Update Contact Info</button>
      </div>
      <div class="control">
        <button @click="fetchFamiliesNotVisited" class="button is-link">Families Not Visited</button>
      </div>
      <div class="control">
        <button @click="gatherSelectedMemberIds" class="button is-link">Gather Member Ids</button>
        <textarea onfocus="this.select()" v-if="selectedMemberIds.length > 0" id="" name="" cols="30" rows="10">{{selectedMembersSql}}</textarea>
      </div>
    </div>
    
    <p class="fetched-message">{{ messages.fetched }}</p>
    <p class="toast" v-html="messages.actions"></p>
    
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
      selectedMemberIds: [],
      selectedMembersSql: null, 
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
    gatherSelectedMemberIds: function() {
      this.selectedMemberIds = this.selectedMembers.map(member => member.id);
      this.selectedMembersSql = `select * from ward_members where id in (${this.selectedMemberIds.join(", ")})`;
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
    fetchFamiliesNotVisited: function(refresh = true) {
      this.$socket.emit('db:wardMembers:fetchFamiliesNotVisited');
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
    importMembers: function() {
			this.$socket.emit('db:wardMembers:import', {members: this.newRecords, offices: this.offices});
    }, 
    archiveMembers: function() {
			this.$socket.emit('db:wardMembers:archive', {memberIds: this.removedIds});
    }, 
    updateContactInfo: function(){
      const offsetAmount = 3000;
      let offset = 0;

      const targetedMembers = (this.selectedMembers.length > 0) ? this.selectedMembers : this.members;
      
      // this.members.slice(0,1).forEach(member => {
      targetedMembers.forEach(member => {
        offset += offsetAmount;
        setTimeout(() => {
          this.$socket.emit('sendShellCommand:updateContactInfo', {cmd: btoa(this.fetchCommand), memberId: member.id, refresh: true});
        }, offset);
      });
    },
  },
  sockets:{
    "WardMembers:blah": function(data){
		  console.log('WardMembers:blah', data);
			this.$socket.emit('WardMembers:blah', {msg: 'bleh'});
    },
    "db:wardMembers:fetchFamiliesNotVisited:done": function(data){
		  console.log('db:wardMembers:fetchFamiliesNotVisited:done', data);
      
      this.selectedMembers.length = 0;
      //this.unselectedMembers = data.responsePayload;
      this.unselectedMembers = data.responsePayload;
			window.Event.$emit('MemberList:update');
    },
    "xsendShellCommand:getPhotoUrl:done": function(data){
		  console.log('sendShellCommand:getPhotoUrl:done', data);

      const photoDetails = JSON.parse(data.json);
      {
        setTimeout(() => {
          this.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(this.fetchCommand), memberId: data.memberId, photoUrl: photoDetails.imageUrl, refresh: true, photoCacheDir: 'ward-photos-cache'});
        }, 3000);
      }
      
    },
    "sendShellCommand:updateContactInfo:done": function(data){
      const memberInfo = JSON.parse(data.json);
		  console.log('sendShellCommand:updateContactInfo:done', memberInfo);

      const { photoUrl: hohPhotoUrl, individualId: hohId } = memberInfo.headOfHousehold;
      const { photoUrl: spousePhotoUrl, individualId: spouseId } = memberInfo.spouse || {};
      const { photoUrl: familyPhotoUrl } = memberInfo.householdInfo;
      const familyId = `${memberInfo.householdInfo.individualId}-family`;

      // const { imageId: hohImageId, individualId: hohId } = memberInfo.headOfHousehold;
      // const { imageId: spouseImageId, individualId: spouseId } = memberInfo.spouse;
      // const { imageId: familyImageId } = memberInfo.householdInfo;
      // const familyId = `${memberInfo.householdInfo.individualId}-family`;

      {
        setTimeout(() => {
          // this.$socket.emit('sendShellCommand:getPhotoUrl', {cmd: btoa(this.fetchCommand), memberId: hohId, refresh: true, photoCacheDir: 'ward-photos-cache', imageId: hohImageId});
          this.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(this.fetchCommand), memberId: hohId, photoUrl: hohPhotoUrl, refresh: true, photoCacheDir: 'ward-photos-cache'});
          
        }, 3000);
      }

      {
        setTimeout(() => {
          this.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(this.fetchCommand), memberId: spouseId, photoUrl: spousePhotoUrl, refresh: true, photoCacheDir: 'ward-photos-cache'});
          
        }, 4000);
      }

      {
        setTimeout(() => {
          this.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(this.fetchCommand), memberId: familyId, photoUrl: familyPhotoUrl, refresh: true, photoCacheDir: 'ward-photos-cache'});
          
        }, 5000);
      }

      // {
      //   setTimeout(() => {
      //     this.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(this.fetchCommand), memberId: hohId, refresh: true, photoCacheDir: 'ward-photos-cache', imageId: hohImageId});
      //   }, 3000);
      // }

      // this.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(this.fetchCommand), memberId: spouseId, refresh: true, photoCacheDir: 'ward-photos-cache', photoUrl: spousePhotoUrl});
      // this.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(this.fetchCommand), memberId: familyId, refresh: true, photoCacheDir: 'ward-photos-cache', familyPhotoUrl});

      const { email, phone } = memberInfo.headOfHousehold;
      this.toastMessage('actions', `Fetched member information for ${memberInfo.coupleName}: ${JSON.stringify({ email, phone })}`);
    },
    "sendShellCommand:fetchMemberListSummary:done": function(data){
		  console.log('sendShellCommand:fetchMemberListSummary:done', data);
      if (data.err) return console.error(data.err);
      this.members = data.members;
      this.newRecords = data.newRecords || [];
      this.removedIds = data.removedIds || [];

      const diffRecordsLength = this.newRecords.length + this.removedIds.length;
      this.toastMessage('fetched', `Successful fetch.  ${(diffRecordsLength === 0) ? 'Local records are already synched.' : 'Updates found.'}`);

      this.unselectedMembers = this.members;
			window.Event.$emit('MemberList:update');
    },
    "db:wardMembers:import:done": function(data){
      this.fetchMembers(false);
      
      if (data.err) {
        this.messages.import = JSON.stringify(data.err);
      } else {
        this.toastMessage('import', `Successful import; ${JSON.stringify(data.payload).slice(0,100)}...`);
        this.$socket.emit('sendShellCommand:fetchMemberListSummary', {cmd: ''});
      }
		  console.log('db:wardMembers:import:done', data);
    },
    "db:wardMembers:archive:done": function(data){
      if (data.err) {
        this.messages.archive = JSON.stringify(data.err);
      } else {
        this.toastMessage('archive', `Successful archival; ${JSON.stringify(data.payload).slice(0,100)}...`);
        this.$socket.emit('sendShellCommand:fetchMemberListSummary', {cmd: ''});
      }
		  console.log('db:wardMembers:archive:done', data);
    },
    // "sendShellCommand:fetchFamilyDetails:done": function(data){
    //   console.log("sendShellCommand:fetchFamilyDetails:done", data);
    //   const memberDetails = JSON.parse(data.json);
    //   console.log("memberDetails", memberDetails);
    //   this.memberInfo = memberDetails;
    // },
  },// 
  mounted () {
		window.Event.$on('WardMembers:activate', (data) => {
		  console.log('WardMembers:blah', data);
			window.Event.$emit('WardMembers:activated', {msg: 'done'});
		});

		this.$socket.emit('sendShellCommand:fetchMemberListSummary', {cmd: btoa(this.fetchCommand)});
    
  },

  watch: {
    selectedMembers: function (newValue, oldValue) {
      if (newValue.length === 0) this.selectedMemberIds.length = 0;
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

