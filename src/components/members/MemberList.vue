<template>
  <div class="member-list">
    <div :class="autocompleteClasses">
      <autocomplete @results="filterList" :source="members"></autocomplete>
    </div>
    <ul>
      <li class="is-left">{{filteredMembers.length}} members loaded</li>
      <Member @checked="clickMember" v-for="member in filteredMembers" :key="member.id" class="is-left" :member="member" :selected="member.selected"></Member>
    </ul>
  </div>
</template>

<script>
import Autocomplete from 'vuejs-auto-complete'
import Member from '@/components/members/Member';
import _ from 'lodash';

export default {
  name: 'MemberList',
  props: ['name', 'memberIds', 'sendTo', 'checked'],
  components: { Autocomplete, Member },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      members: [],
      stagedMemberIds: [],
      filteredMemberIds: [],
      filteredMembers: [],
      // name: Math.random().toString(36).replace('0.', ''), 
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    autocompleteClasses: function() {
			return [`autocomplete-${this.name}`];
		},
    isFiltered: function() {
      return !(this.filteredMemberIds.length === 0 || this.filteredMemberIds.length === this.memberIds.length);
    },
  },
  methods: {
    filterList: function(res) {
      this.filteredMemberIds = res.results.map(member => member.id);
    }, 
    clearFilters: function() {
		},
    clickMember: function(data) {
      if (this.isFiltered) {
        // const mIdx = this.filteredMemberIds.indexOf(data.memberId);
        // if (mIdx > -1) this.filteredMemberIds.splice(mIdx, 1);
        if (data.checked) this.stagedMemberIds.push(data.memberId);
        else {
          const mIdx = this.stagedMemberIds.indexOf(data.memberId);
          if (mIdx > -1) this.stagedMemberIds.splice(mIdx, 1);
        }
      } else {
        this.checked({...data, removeFrom: this.name, sendTo: this.sendTo});
      }
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

		window.Event.$on('MemberList:Enter', (data) => {
      if (this.stagedMemberIds.length > 0) {
        console.log('MemberList:Enter', this.name);
        this.$parent.appendList(this.name, this.sendTo, this.stagedMemberIds);
        document.querySelector(`.autocomplete-${this.name} .autocomplete input`).value = '';
        document.querySelector(`.autocomplete-${this.name} .autocomplete input`).focus();
        self.filteredMemberIds = self.memberIds;
      }
		});

    const autoCompleteInput = document.querySelector(`.autocomplete-${this.name} .autocomplete input`);
    const self = this;
    autoCompleteInput.addEventListener('keydown', function(event) { 
      if (event.code === 'Enter') {
        console.log('input:Enter', self.filteredMemberIds);
        // const memberIds = (self.stagedMemberIds.length > 0) ? self.stagedMemberIds : self.filteredMemberIds;
        self.$parent.appendList(self.name, self.sendTo, self.filteredMemberIds);

        document.querySelector(`.autocomplete-${self.name} .autocomplete input`).value = '';
        document.querySelector(`.autocomplete-${self.name} .autocomplete input`).focus();
        self.filteredMemberIds = self.memberIds;
      }
    }, false);
  },
  watch: {
    memberIds: function(newValue, oldValue) {
      if (!this.isFiltered) this.members = this.filteredMembers = this.$parent.members.filter(m => this.memberIds.includes(m.id));
    },
    filteredMemberIds: function(newValue, oldValue) {
      this.filteredMembers = this.$parent.members.filter(m => newValue.includes(m.id));
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

