<template>
  <div class="member-list">
    <ul>
      <li class="member is-left">
        <div class="field has-addons">
          <div class="control has-icons-left is-expanded">
            <input :ref="refName" class="input is-rounded" type="text" v-model="search">
            <span class="icon is-small is-left">
              <i class="fas fa-search"></i>
            </span>
            
            <p><a @click="selectItems(true)">All</a> | <a @click="selectItems(false)">None</a></p>
          </div>
          <div class="control">
            <a @click="pressEnter" class="button">
              <span class="icon is-small">
                <i class="fas fa-magic"></i>
              </span>
            </a>
          </div>
          <div class="control">
            <a @click="clearFilter(true)" class="button is-rounded">
              <span class="icon is-small">
                <i class="fas fa-ban"></i>
              </span>
            </a>
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
    refName: function() {
			return `${this.listName}-filter`;
		},
  },
  methods: {
    junk: function() {
		},
    selectItems: function(checked) {
      if (this.mode === 'move') {
        if (checked) {
          this.mode = 'stage';
          this.filteredList = this.members;
        }
        return window.Event.$emit('Member:select', {checked, memberIds: this.members.map(m => m.id)});
      }
      else if (this.mode === 'stage') {
        return window.Event.$emit('Member:select', {checked, memberIds: this.filteredList.map(m => m.id)});
      }
		},
    pressEnter: function() {
      window.Event.$emit('MemberList:Enter');
      this.$refs[this.refName].focus();
		},
    clearFilter: function(focus=false) {
      this.search = '';
      this.mode = 'move';
      this.filteredList = [];
      if (focus) this.$refs[this.refName].focus();
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
      if (this.mode === 'stage' && this.search.length === 0) return this.clearFilter();
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

