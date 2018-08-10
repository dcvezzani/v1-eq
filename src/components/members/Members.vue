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


    <div class="member-lists">
      <div class="columns">
        <div v-show="true || newRecords.length > 0" class="column">
          <p>{{ newRecords.length }} new records <span v-if="newRecords.length > 0">| <a @click="importMembers" href="#">Import</a></span></p>
          <p class="import-error">{{ messages.import }}</p>
          <pre class="formattedJson">{{ newRecords }}</pre>
        </div>

        <div v-show="true || removedIds.length > 0" class="column">
          <p>{{ removedIds.length }} removed records <span v-if="removedIds.length > 0">| <a @click="archiveMembers" href="#">Archive</a></span></p>
          <p class="import-error">{{ messages.archive }}</p>
          <pre class="formattedJson">{{ removedIds }}</pre>
        </div>
      </div>
    
      <div class="columns">
        <div class="column">
          <MemberList 
            name="unselectedIds" 
            :memberIds="unselectedIds" 
            :sendTo="lists.unselectedIds.sendTo"
            :checked="checked"
            ></MemberList>
        </div>

        <div class="column">
          <MemberList 
            name="selectedIds" 
            :memberIds="selectedIds" 
            :sendTo="lists.selectedIds.sendTo"
            :checked="checked"
            ></MemberList>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MemberList from '@/components/members/MemberList';
import Member from '@/components/members/Member';
import Autocomplete from 'vuejs-auto-complete'

const randomIdentifier = () => {
  return Math.random().toString(36).replace('0.', '');
}

export default {
  name: 'Members',
  props: ['name'],
  components: { MemberList, Member, Autocomplete },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fetchCommand: '',
      members: [],
      selectedIds: [],
      unselectedIds: [],
      offices: [],
      newRecords: [],
      removedIds: [],
      messages: {
        import: null,
        archive: null,
      },
      lists: {
        unselectedIds: {sendTo: 'selectedIds'}, 
        selectedIds: {sendTo: 'unselectedIds'}, 
      }, 
      listeningForEnter: false, 
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
  },
  methods: {
    checked: function({removeFrom, sendTo, memberId, checked}) {
      this.appendList(removeFrom, sendTo, [memberId]);
    },
    appendList: function(removeFrom, sendTo, memberIds) {
      memberIds.forEach(mId => this[sendTo].push(mId));
      memberIds.forEach(mId => {
        const mIdx = this[removeFrom].indexOf(mId);
        if (mIdx > -1) this[removeFrom].splice(mIdx,1);
      });
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
    enterListener: function(event) { 
      if (event.code === 'Enter') {
        window.Event.$emit('MemberList:Enter');
      }
    }, 
    removeEnterListener: function() {
      if (this.listeningForEnter) {
        document.removeEventListener('keydown', this.enterListener, false);
        this.listeningForEnter = false;
      }
    },
    addEnterListener: function() {
      if (!this.listeningForEnter) {
        document.addEventListener('keydown', this.enterListener, false);
        this.listeningForEnter = true;
      }
    },
  },
  sockets:{
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
      if (data.err) return console.error(data.err);
      const parsedData = JSON.parse(data.stdout)[0];
      this.members = parsedData.members;
      this.offices = parsedData.filterOffices;
      this.newRecords = data.newRecords || [];
      this.removedIds = data.removedIds || [];

      this.selectedIds = this.members.slice(0,10).map(m => m.id);
      this.unselectedIds = this.members.slice(50, 70).map(m => m.id);
			window.Event.$emit('MemberList:update');
    },
  },
  mounted () {
		window.Event.$on('any:listen-for-enter:add', () => {
      this.addEnterListener();
		});

		window.Event.$on('any:listen-for-enter:remove', () => {
      this.removeEnterListener();
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
