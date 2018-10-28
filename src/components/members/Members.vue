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
    
      <div class="xtabs">
        <a @click="selectedActiveTab = 'details'">Details</a> | 
        <a @click="selectedActiveTab = 'lists'">Lists</a> | 
        <a @click="toggleListLoader">Loader</a>
      </div>

      <div v-show="selectedMembers.length > 0" class="selected-actions">
      </div>
        <button @click="createNotes" class="button is-link">Create Notes</button>
        <button @click="fetchFamilyDetails" class="button is-link">Fetch Details</button>
        <button @click="fetchFamilyDetailsBatch" class="button is-link">Fetch Details (Batch)</button>
        <p class="toast" v-html="messages.actions"></p>
        
      <div class="columns">
        <div class="column">
          <div v-show="selectedActiveTab == 'details'" class="xtab-details">
            <MemberList :members="unselectedMembers" listName="unselectedMembers" @changeMode="changeMode" @moveMembers="moveMembers"></MemberList>
          </div>

          <div v-show="selectedActiveTab == 'lists'" class="xtab-details">
            <p class="tag-list" v-show="currentListName">Current List: <span class="title">{{currentListName}}</span></p>
            <ul class="tag-list">
              <li v-for="tag in tags" :key="tag.id">{{tag.name}} | <a @click="hideMembers">hide</a> | <a @click="loadMembersForTag(tag, false)">add</a> | <a @click="loadMembersForTag(tag)">replace</a> </li>
            </ul>
            <ul class="tag-list">
              <li>
                <div class="field has-addons">
                  <div class="control has-icons-left is-expanded">
                    <input class="input is-rounded" type="text" v-model="randomMemberCount">
                    <span class="icon is-small is-left">
                      <i class="fas fa-search"></i>
                    </span>
                  </div>
                  <div class="control">
                    <input class="input is-rounded" type="text" v-model="groupPrefix">

                  </div>
                  <div class="control">
                    <a @click="selectRandomMembersWithTagPrefix" class="button">
                      <span class="icon is-small">
                        <i class="fas fa-magic"></i>
                      </span>
                    </a>
                  </div>
                  <div class="control">
                    <a @click="randomMemberCount = 8" class="button is-rounded">
                      <span class="icon is-small">
                        <i class="fas fa-ban"></i>
                      </span>
                    </a>
                  </div>
                </div>
                <p >Available: {{availableMembersCnt}}</p>
              </li>
            </ul>
          </div>
        </div>

        <div class="column">
          <MemberList :members="selectedMembers" listName="selectedMembers" @changeMode="changeMode" @moveMembers="moveMembers"></MemberList>

          <div v-show="listLoaderActive" class="member-ids-loader">
            <div class="field">
              <textarea v-model="memberIdsToLoadList" class="textarea" placeholder="paste member ids here"></textarea>
            </div>
            <div class="field">
              <a @click="loadMemberIds" class="button is-link"> Load IDs </a>
            </div>
          </div>

          <div v-show="selectedMembers.length > 0" class="selected-actions">
            <div v-show="selectedActiveTab == 'details'" class="xtab-details">
              <div v-if="memberInfo" class="member-info">
                <p class="title">Contact Info:</p>
                <div class="member-info-name">{{memberInfo.coupleName}}</div>
                <div class="member-info-address">{{formattedAddress(memberInfo.householdInfo.address)}}</div>
                <div class="member-info-phone"><span v-html="formattedPhone(memberInfo.householdInfo.phone)"></span> </div>
                <div class="member-info-email"><span v-html="formattedEmail(memberInfo.headOfHousehold.email)"></span> </div>

                <div style="text-align: left">
                  <img v-show="memberInfo.headOfHousehold.photoUrl.length > 0" :src="memberInfo.headOfHousehold.photoUrl" title="headOfHousehold" class="memberPhoto">
                  <img v-show="memberInfo.headOfHousehold.photoUrl.length === 0" src="http://localhost:8095/photos/person-placeholder.jpg" :title="memberInfo.headOfHousehold.name" class="memberPhoto">
                  
                  <img v-show="memberInfo.householdInfo.photoUrl.length > 0" :src="memberInfo.householdInfo.photoUrl" :title="memberInfo.householdInfo.name + ' family'" class="memberPhoto">
                  <img v-show="memberInfo.householdInfo.photoUrl.length === 0" src="http://localhost:8095/photos/person-placeholder.jpg" :title="memberInfo.householdInfo.name + ' family'" class="memberPhoto">
                  
                  <span v-if="memberInfo.spouse">
                    <img v-show="memberInfo.spouse.photoUrl.length > 0" :src="memberInfo.spouse.photoUrl" title="spouse" class="memberPhoto">
                    <img v-show="memberInfo.spouse.photoUrl.length === 0" src="http://localhost:8095/photos/person-placeholder.jpg" :title="memberInfo.spouse.name" class="memberPhoto">
                  </span>

                  <img v-for="other in memberInfo.otherHouseholdMembers" :key="other.individualId" :src="(other.photoUrl.length > 0) ? other.photoUrl : 'http://localhost:8095/photos/person-placeholder.jpg'" :title="other.name" class="memberPhoto">
                </div>
              </div>
            </div>
          </div>

            <div v-show="selectedActiveTab == 'lists'" class="xtab-details">
              <div class="field has-addons">
                <div class="control">
                  <input v-model="applyTagName" class="input" type="text" placeholder="Tag name">
                </div>
                <div class="control">
                  <a @click="applyTags2" class="button is-link"> Apply Tag </a>
                </div>
              </div>
              
              <div class="field ">
                <button @click="applyTags" class="button is-link">Apply Tags</button>

                <ul class="tags">
                  <li class="tag" v-for="tag in tags" :key="tag.id">
                    <label class="checkbox"> <input v-model="selectedTags" :value="tag.id" type="checkbox"> {{tag.name}}</label>
                  </li>
                </ul>
              </div>

              <div class="field has-addons">
                <div class="control">
                  <input v-model="newTagName" class="input" type="text" placeholder="Tag name">
                </div>
                <div class="control">
                  <a @click="createTag" class="button is-link"> Create Tag </a>
                </div>
              </div>

              <div class="field has-addons">
                <div class="control">
                  <input v-model="delTagName" class="input" type="text" placeholder="Tag name">
                </div>
                <div class="control">
                  <a @click="deleteTag" class="button is-link"> Delete Tag </a>
                </div>
              </div>

              <div class="field has-addons">
                <div class="control">
                  <input v-model="removeTagName" class="input" type="text" placeholder="Tag name">
                </div>
                <div class="control">
                  <a @click="removeMembersFromTag" class="button is-link"> Remove Members </a>
                </div>
              </div>

              <div class="field has-addons">
                <button @click="hideMembers" class="button is-link">Hide Members</button>
              </div>
            </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
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
      fetchCommand: ``,
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
      memberInfo: null,
      selectedActiveTab: 'details', 
      tags: [],
      newTagName: null,
      delTagName: null,
      selectedTags: [],
      randomMemberCount: 8,
      removeTagName: null,
      applyTagName: null,
      checkedLists: {},
      currentListName: '',
      availableMembersCnt: 0,
      groupPrefix: '',
      memberIdsToLoadList: '',
      listLoaderActive: false,
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    membersById: function() {
			return this.members.reduce((hash, member) => {hash[member.id] = member; return hash}, {});
		},
    memberIdsToLoad: function() {
      return this.memberIdsToLoadList.replace(/\"/g, '').split(/ *[,\n] */).map(memberId => parseInt(memberId));
    },
  },
  methods: {
    toggleListLoader: function(event) { 
      this.listLoaderActive = !(this.listLoaderActive);
    }, 
    loadMemberIds: function(event) { 
      // console.log(">>>memberIdsToLoad", this.memberIdsToLoad);
      this.moveMembers({listName: 'unselectedMembers', memberIds: this.memberIdsToLoad});
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
      if (listName === 'selectedMembers') this.memberInfo = null;
		},
    formattedAddress: function(address) {
      const { addr1, addr2, addr3 } = address;
      return [addr1, addr2, addr3].join(" ");
    },
    formattedPhone: function(phone) {
      if (phone) {
        const cleanPhone = phone.toString().replace(/^\W+/, '').replace(/\W+$/, '');
        return ` <a href="tel:${cleanPhone}">${cleanPhone}</a> `;
      } else {
        return ` <span>Phone n/a</span> `;
      }
    },
    formattedEmail: function(email) {
      if (email) {
      const cleanEmail = email.toString().replace(/^\W+/, '').replace(/\W+$/, '');
      return ` <a href="mailto:${cleanEmail}">${cleanEmail}</a> `;
      } else {
        return ` <span>Email n/a</span> `;
      }
    },

    deleteTag: function() {
      this.$socket.emit('db:tags:delete', {name: this.delTagName});
    },
    removeMembersFromTag: function() {
      const checkedMembers = this.checkedListsAll();
      console.log(">>>checkedMembers", checkedMembers);
      const checkedMemberIds = (checkedMembers.length > 0) ? checkedMembers.map(member => member.id) : this.selectedMembers.map(member => member.id);
      this.$socket.emit('db:tags:removeMembers', {name: this.removeTagName, memberIds: checkedMemberIds});
    },
    checkedListsAll: function() {
      let allChecked = [];
      Object.keys(this.checkedLists).forEach(listName => {
        if (this.checkedLists[listName]) allChecked = allChecked.concat(this.checkedLists[listName]);
      });
			return allChecked;
		},
    createTag: function() {
      if (this.newTagName && this.newTagName.length > 0) {
        const selectedMemberIds = this.selectedMembers.map(member => member.id);
        let options = {name: this.newTagName};
        if (selectedMemberIds.length > 0) options = {...options, memberIds: selectedMemberIds}
        this.$socket.emit('db:tags:create', options);
      }
    },
    loadMembersForTag: function({id: tagId, name: tagName}, replace=true) {
			// window.Event.$emit('MemberList:clear');
      this.currentListName = (replace) ? tagName : '(mixed)';
      if (replace) this.moveMembers({listName: 'selectedMembers', memberIds: this.selectedMembers.map(member => member.id)});
      this.$socket.emit('db:tags:loadMembers', {tagId, replace});
    },

    createNotes: function() {
      this.selectedMembers.forEach(member => {
        this.$socket.emit('sendShellCommand:fetchFamilyDetails', {cmd: btoa(this.fetchCommand), memberId: member.id, refresh: true, redirects: ['sendShellCommand:fetchFamilyDetails:createNotes:done', 'sendShellCommand:fetchFamilyDetails:done']});
      });
    },
    fetchMembers: function(refresh = true) {
      const source = (refresh) ? "lds.org" : "cache or lds.org";
      this.toastMessage('fetched', `Fetching data from ${source}.  Please wait...`)
			this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand), refresh});
		},
    fetchFamilyDetailsBatch: function(event, refresh = true) {
      const self = this;
      const increment = 3000
      let offset = 0
      this.selectedMembers.forEach(member => {
        offset += increment;
        setTimeout(() => {
          console.log(`fetching member.id: ${member.id}`)
          self.$socket.emit('sendShellCommand:fetchFamilyDetails', {cmd: btoa(self.fetchCommand), memberId: member.id, refresh: (refresh === true)});
        }, offset);
      });
		},
    fetchPhotoFile: function(memberId, photoUrl) {
      const self = this;
      console.log(`fetching fetchPhotoFile for memberId: ${memberId}`)
      self.$socket.emit('sendShellCommand:fetchPhotoFile', {cmd: btoa(self.fetchCommand), memberId, photoUrl, refresh: true});
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
    allTags: function() {
			this.$socket.emit('db:tags:all');
    },
    applyTags: function() {
      const memberIds = this.selectedMembers.map(member => member.id);
      
		  console.log('db:tags:apply', {memberIds, tagIds: this.selectedTags});
			this.$socket.emit('db:tags:apply', {memberIds, tagIds: this.selectedTags});
      this.selectedTags.length = 0;
    },
    applyTags2: function() {
      const selectedTags = this.tags.filter(tag => tag.name === this.applyTagName);
      const tagIds = selectedTags.map(tag => tag.id);
      const memberIds = this.selectedMembers.map(member => member.id);
      
		  console.log('db:tags:apply', {memberIds, tagIds});
			this.$socket.emit('db:tags:apply', {memberIds, tagIds});
      // this.selectedTags.length = 0;
    },
    toastMessage: function(type, message, timeout=3000) {
      setTimeout(() => this.messages[type] = null, timeout);
      this.messages[type] = message;
    }, 

    selectRandomMembers: function(event) {
      const availableMembers = this.unselectedMembers.filter(member => !member.hidden);
      this.availableMembersCnt = availableMembers.length;
      const unselectedMemberIds = availableMembers.map(member => member.id);
      console.log("selectRandomMembers", event, unselectedMemberIds);
      const memberIds = _.shuffle(unselectedMemberIds).slice(0, this.randomMemberCount);
      this.moveMembers({listName: 'unselectedMembers', memberIds});
    },
    selectRandomMembersWithTagPrefix: function(event) {
      console.log("selectRandomMembersWithTagPrefix");
      let memberGroups = {}
      let availableMembers = _.shuffle(this.unselectedMembers.filter(member => !member.hidden));
      let idx = 0;

      while(availableMembers.length > 0) {
        idx += 1;
        const memberIds = availableMembers.slice((-1)*this.randomMemberCount).map(member => member.id);
        availableMembers.forEach(member => member['hidden'] = true);
        availableMembers.length -= (this.randomMemberCount < this.availableMembersCnt) ? this.randomMemberCount : this.availableMembersCnt;

        memberGroups[`${this.groupPrefix}-${_.padStart(idx, 2, '0')}`] = memberIds;
        this.availableMembersCnt = availableMembers.length;
        console.log("this.availableMembersCnt", this.availableMembersCnt);
        console.log("availableMembers.length", availableMembers.length);
      }

      this.$socket.emit('db:tags:createTagGroups', {groups: memberGroups});
      // this.moveMembers({listName: 'unselectedMembers', memberIds});
    },
    hideMembers: function() {
      const checkedExplicitMembers = this.checkedListsAll();
      const checkedMembers = (checkedExplicitMembers.length > 0) ? checkedExplicitMembers : this.selectedMembers;
      console.log(">>>hideMembers", checkedMembers);

      checkedMembers.forEach(member => member["hidden"] = true);
      this.availableMembersCnt = this.unselectedMembers.filter(member => !member.hidden).length;
      
      // this.selectedMembers = this.selectedMembers.filter(member => !checkedMemberIds.includes(member.id))
      // this.$socket.emit('db:tags:removeMembers', {name: this.removeTagName, memberIds: checkedMemberIds});
    }, 
  },
  sockets:{
    "db:tags:db:tags:createTagGroups:done": function(data){
		  console.log('db:tags:db:tags:createTagGroups:done', data);
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successfully created member groups`);
      }
			this.$socket.emit('db:tags:all');
    },
    "db:tags:removeMembers:done": function(data){
		  console.log('db:tags:removeMembers:done', data.responsePayload.tags, data);
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successfully removed members from tag`);
      }
			this.$socket.emit('db:tags:all');
      this.checkedLists = {};
      // data.responsePayload.tags.forEach(tagId => );
      if (data.responsePayload.tags.length > 0) this.loadMembersForTag(data.responsePayload.tags[0]);
    },
    "db:tags:delete:done": function(data){
		  console.log('db:tags:delete:done', data);
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successfully deleted tag`);
      }
			this.$socket.emit('db:tags:all');
    },
    "db:tags:create:done": function(data){
		  console.log('db:tags:create:done', data);
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successfully created tag`);
      }
      this.currentListName = data.responsePayload.name;
			this.$socket.emit('db:tags:all');
    },
    "db:tags:all:done": function(data){
		  console.log('db:tags:all:done', data);
      this.tags = data.responsePayload;
    },
    "db:tags:loadMembers:done": function(data){
		  console.log('db:tags:loadMembers:done', data.responsePayload.memberIds);
      if (data.replace) this.moveMembers({listName: 'selectedMembers', memberIds: this.selectedMembers.map(member => member.id)});
      this.moveMembers({listName: 'unselectedMembers', memberIds: data.responsePayload.memberIds});
    },
    "db:tags:apply:done": function(data){
		  console.log('db:tags:apply:done', data);
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successfully applied tag(s)`);
      }
    },
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
    "sendShellCommand:fetchPhotoFile:done": function(data){
      console.log("sendShellCommand:fetchPhotoFile:done", data);
    },
    "sendShellCommand:fetchFamilyDetails:createNotes:done": function(data){
      const familyDetails = JSON.parse(data.json);
      console.log("sendShellCommand:fetchFamilyDetails:createNotes:done", familyDetails);

      createNotes(familyDetails.coupleName, (err, res) => {
        console.log("createNotes", err, res);
        this.toastMessage('actions', `Notes created: <a target="_new" href="https://docs.google.com/document/d/${res.body.apiRes.data.id}/edit">${familyDetails.coupleName}</a>`);
      });
    },

    "sendShellCommand:fetchFamilyDetails:done": function(data){
      console.log("sendShellCommand:fetchFamilyDetails:done", data);
      const memberDetails = JSON.parse(data.json);
      this.memberInfo = memberDetails;

      {
        setTimeout(() => {this.fetchPhotoFile(data.memberId, memberDetails.headOfHousehold.photoUrl);}, 3000);
      }

      const familyId = `${memberDetails.householdInfo.individualId}-family`;
      {
        setTimeout(() => {this.fetchPhotoFile(familyId, memberDetails.householdInfo.photoUrl);}, 3000);
      }

      // this.memberPhotos.length = 0;
      // if (memberDetails.headOfHousehold) {
      //   const { name, photoUrl } = memberDetails.headOfHousehold;
      //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      // }
      // if (memberDetails.spouse) {
      //   const { name, photoUrl } = memberDetails.spouse;
      //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      // }
      // if (memberDetails.householdInfo) {
      //   const { name, photoUrl } = memberDetails.householdInfo;
      //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      // }
      // memberDetails.otherHouseholdMembers.forEach(other => {
      //   const { name, photoUrl } = other;
      //   if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      // });

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
      this.availableMembersCnt = this.unselectedMembers.length;
			window.Event.$emit('MemberList:update');
    },
  },
  mounted () {
    window.Event.$on('Members:checkedList', (listName, checkedList) => {
      this.checkedLists[listName] = checkedList;
    });
  
		this.$socket.emit('sendShellCommand:fetchMembers', {cmd: btoa(this.fetchCommand)});
    this.allTags();
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
p.title {
  font-size: 14pt;
  font-weight: bold;
}
.member-info {
  margin: 1em 0;
}
.member-info div, 
.xtabs * {
  text-align: left; 
}
.tag-list {
  margin-top: 2em;
}
.tag-list, 
.tag-list li {
  text-align: right; 
}
.memberPhoto {
  width: 100px;
}
</style>
