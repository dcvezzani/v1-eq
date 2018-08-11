<template>
  <div class="member-list">
    <ul>
      <li class="member is-left">
        <div class="field">
          <div class="control">
            <input class="input is-rounded" type="text" v-model="search">
            <p>{{ this.mode }}</p>
          </div>
        </div>
      </li>
                
      <div v-if="filteredList.length > 0">
        <Member v-for="member in filteredList" :key="member.id" :member="member" @checked="memberChecked"></Member>
      </div>
      <div v-else>
        <Member v-for="member in members" :key="member.id" :member="member" @checked="memberChecked"></Member>
      </div>
    </ul>

  </div>
</template>

<script>
import Member from '@/components/members/Member';
import _ from 'lodash';

export default {
  name: 'MemberList',
  props: ['listName', 'members', 'updateList'],
  components: { Member },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      search: '',
      mode: 'move', // move | stage
      filteredList: [],
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
    clearFilter: function() {
      this.search = '';
      this.filteredList = [];
		},
    filterList: function(term) {
      console.log("filterList", term);
      const reFilter = new RegExp(term, 'i');
      this.filteredList = this.members.filter(m => m.name.match(reFilter));
		},
    memberChecked: function(member) {
      console.log("member checked", member, this.mode);
      if (this.mode === 'move') return this.$emit("moveMembers", {listName: this.listName, memberIds: [member.id]});
		},
  },
  sockets:{
    "MemberList:blah": function(data){
		  console.log('MemberList:blah', data);
			this.$socket.emit('MemberList:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('MemberList:activate', (data) => {
		  console.log('MemberList:blah', data);
			window.Event.$emit('MemberList:activated', {msg: 'done'});
		});

    window.Event.$on('MemberList:filterList', (listName) => {
      if (this.listName === listName) this.filterList(this.search);
		});

    window.Event.$on('MemberList:Enter', () => {
      if (this.mode === 'stage') {
        const stagedMemberIds = this.filteredList.filter(m => m.selected).map(m => m.id);
        if (stagedMemberIds.length > 0) {
          return this.$emit("moveMembers", {listName: this.listName, memberIds: stagedMemberIds});
        }

        const memberIds = this.filteredList.map(m => m.id);
        this.clearFilter();
        return this.$emit("moveMembers", {listName: this.listName, memberIds});
      }
    });

    this.debouncedSearch = _.debounce(() => {
      if (this.search.length > 0) this.filterList(this.search);
      else this.filteredList = [];
    }, 250)
  },
  watch: {
    search: function (newValue, oldValue) {
      this.mode = (newValue.length > 0) ? 'stage' : 'move';
      this.debouncedSearch();
    },
    mode: function (newValue, oldValue) {
      if (newValue !== oldValue) this.$emit("changeMode", {listName: this.listName, mode: this.mode});
    },
    members: function (newValue, oldValue) {
      if (this.mode === 'stage') window.Event.$emit('MemberList:filterList', this.listName);
    },
    filteredList: function (newValue, oldValue) {
      if (newValue.length === 0) this.search = '';
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

