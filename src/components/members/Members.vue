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

          <div v-show="selectedMembers.length > 0" class="selected-actions">
            <div class="xtabs">
              <a @click="selectedActiveTab = 'details'">Details</a> | 
              <a @click="selectedActiveTab = 'lists'">Lists</a> | 
            </div>
          
            <div v-show="selectedActiveTab == 'details'" class="xtab-details">
              <button @click="createNotes" class="button is-link">Create Notes</button>
              <button @click="fetchFamilyDetails" class="button is-link">Fetch Details</button>
              <button @click="fetchFamilyDetailsBatch" class="button is-link">Fetch Details (Batch)</button>
              <p class="toast" v-html="messages.actions"></p>

              <div v-if="memberInfo" class="member-info">
                <p class="title">Contact Info:</p>
                <div class="member-info-name">{{memberInfo.coupleName}}</div>
                <div class="member-info-address">{{formattedAddress(memberInfo.householdInfo.address)}}</div>
                <div class="member-info-phone"><span v-html="formattedPhone(memberInfo.householdInfo.phone)"></span> </div>
                <div class="member-info-email"><span v-html="formattedEmail(memberInfo.headOfHousehold.email)"></span> </div>
              </div>

              <div v-for="{ name, photoUrl } in memberPhotos" class="memberPhoto"><img :src="photoUrl" :title="name"></div>
            </div>

            <div v-show="selectedActiveTab == 'lists'" class="xtab-details">
              <div class="field ">
                <button @click="allTags" class="button is-link">Fetch Tags</button>
                <button @click="applyTags" class="button is-link">Apply Tags</button>
              </div>

              <div class="field has-addons">
                <div class="control">
                  <input v-model="newTagName" class="input" type="text" placeholder="Tag name">
                </div>
                <div class="control">
                  <a @click="createTag" class="button is-link">
                    Create Tag
                  </a>
                </div>
              </div>

              <ul class="tags">
                <li class="tag" v-for="tag in tags" :key="tag.id">
                  <label class="checkbox"> <input v-model="selectedTags" :value="tag.id" type="checkbox"> {{tag.name}} </label>
                </li>
              </ul>
            </div>
            
          </div>
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
      fetchCommand: `curl 'https://lcr.lds.org/services/orgs/sub-orgs-with-callings?lang=eng&subOrgId=5873015' -H 'pragma: no-cache' -H $'cookie: audience_split=64; aam_uuid=63419155236752781521446756028120250735; lds-preferred-lang-v2=eng; audience_id=501805; WRUID=1640016059515610; aam_tnt=aam%3D662001; aam_sc=aamsc%3D662001%7C708195%7C855179%7C662001; lds-preferred-lang=eng; _CT_RS_=Recording; __CT_Data=gpv=178&apv_310_www11=3&cpv_310_www11=3&ckp=tld&dm=lds.org&apv_59_www11=175&cpv_59_www11=175&rpv_59_www11=174; ctm={\'pgv\':1003506360507272|\'vst\':999856181377944|\'vstr\':4158988253884699|\'intr\':1535408490233|\'v\':1|\'lvst\':1242}; cr-aths=shown; check=true; s_cc=true; audience_s_split=100; AMCVS_66C5485451E56AAE0A490D45%40AdobeOrg=1; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg=1099438348%7CMCIDTS%7C17781%7CMCMID%7C63648270562000236141460435237579820057%7CMCAAMLH-1536523066%7C9%7CMCAAMB-1536797566%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1536199966s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-17784%7CvVersion%7C2.1.0; amlbcookie=74; JSESSIONID=0; ADRUM=s=1536208258965&r=https%3A%2F%2Fwww.lds.org%2F%3F479231918; TS01b89640=01999b70236b15dcbd7f11270de75449f16606deee4534cf43afece1acb27337efbc85cdba2448cf2c22afcb72409aa84cf2cff1f118a42b398b4742a16f44580815d6a16d; lds-id=AQIC5wM2LY4Sfcw_DywDi_LOMNhHgOkdit9EPzt0mKEWhss.*AAJTSQACMDIAAlNLABQtNjA0NzQ2NDc4MjY2NDM5NzQ0NgACUzEAAjA0*; s_ppvl=https%253A%2F%2Fwww.lds.org%2Fdirectory%2F%253Flang%253Deng%2C98%2C89%2C1122%2C1182%2C1122%2C2560%2C1440%2C1%2CL; s_ppv=https%253A%2F%2Fwww.lds.org%2Fdirectory%2F%253Flang%253Deng%2523%2C98%2C89%2C1122%2C1182%2C1122%2C2560%2C1440%2C1%2CL; __VCAP_ID__=cb8981c6-066a-488f-464d-f3ec; ObSSOCookie=YyDnyzbNe88RoV9X6LoOUKxkN1Skh7DC5fmRcMBsbz8xLS45mYZGxWxwAYmpS5eNtuMj77PrjXmLOj7x1d%2FJRb7yqEveU9JrvDx7Yevr%2Bp96bv3AbuVejZwqkappiHTd9s%2BfgbvGmsskq2xkxumDnvIZn3qBApCfq2zQ8O0FXWDMhEnlK7HLakpY9JUyvl0v6WSJkmqXZCv8%2FLAQlb1ykYGe1RAPvLrefG1%2Bwp5Jdmu5hMQL6a5Wyz5EOR31G851nB3x2TchglV4frzcF%2BRwOgymjg13i92oDajEG7mJMZJOdAXmDS3BkpYAPOrZyGCWpv%2BlwRgUQfb5AmH8%2BdXOcHddoundsJB2C%2BCIHxBxMJY%3D; mbox=PC#122fc9ed0cd34b3d95e257b21817afe4.17_80#1541530570|session#209b313cace940019f8a8cf99fbf3b23#1536297182; ADRUM_BTa=R:40|g:4f86d848-0c6e-41c6-a9b5-6e796ece9cda|n:customer1_acb14d98-cf8b-4f6d-8860-1c1af7831070; ADRUM_BT1=R:40|i:14049|e:218; utag_main=v_id:015ed4d1af5a0017e3d97706b96505079001d07100fb8$_sn:132$_ss:0$_st:1536297136353$vapi_domain:lds.org$dc_visit:132$ses_id:1536294423316%3Bexp-session$_pn:3%3Bexp-session$dc_event:7%3Bexp-session$dc_region:us-east-1%3Bexp-session; t_ppv=undefined%2C100%2C79%2C1122%2C18059; s_sq=ldsall%3D%2526pid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252Forgs%25252F5873015%25253Flang%25253Deng%2526oid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252Forgs%25252F5873015%25253Flang%25253Deng%2526ot%253DA' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36' -H 'accept: application/json, text/plain, */*' -H 'cache-control: no-cache' -H 'authority: lcr.lds.org' -H 'referer: https://lcr.lds.org/orgs/5873015?lang=eng' --compressed`,
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
      selectedTags: [],
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
    formattedAddress: function(address) {
      const { addr1, addr2, addr3 } = address;
      return [addr1, addr2, addr3].join(" ");
    },
    formattedPhone: function(phone) {
      const cleanPhone = phone.toString().replace(/^\W+/, '').replace(/\W+$/, '');
      return ` <a href="tel:${cleanPhone}">${cleanPhone}</a> `;
    },
    formattedEmail: function(email) {
      const cleanEmail = email.toString().replace(/^\W+/, '').replace(/\W+$/, '');
      return ` <a href="mailto:${cleanEmail}">${cleanEmail}</a> `;
    },

    createTag: function() {
      if (this.newTagName && this.newTagName.length > 0) this.$socket.emit('db:tags:create', {name: this.newTagName});
    },
    selectTag: function(name) {
      if (this.newTagName && this.newTagName.length > 0) this.$socket.emit('db:tags:create', {name: this.newTagName});
    },

    createNotes: function() {
      this.selectedMembers.forEach(member => {
        this.$socket.emit('sendShellCommand:fetchFamilyDetails', {cmd: btoa(this.fetchCommand), memberId: member.id, refresh: true, redirect: 'sendShellCommand:fetchFamilyDetails:createNotes:done'});
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
    },
    toastMessage: function(type, message, timeout=3000) {
      setTimeout(() => this.messages[type] = null, timeout);
      this.messages[type] = message;
    }, 
  },
  sockets:{
    "db:tags:create:done": function(data){
		  console.log('db:tags:create:done', data);
      if (data.err) {
        this.messages.actions = JSON.stringify(data);
      } else {
        this.toastMessage('actions', `Successfully created tag`);
      }
			this.$socket.emit('db:tags:all');
    },
    "db:tags:all:done": function(data){
		  console.log('db:tags:all:done', data);
      this.tags = data.responsePayload;
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
      console.log("memberDetails", memberDetails);
      this.memberInfo = memberDetails;

      {
        setTimeout(() => {this.fetchPhotoFile(data.memberId, memberDetails.headOfHousehold.photoUrl);}, 3000);
      }

      this.memberPhotos.length = 0;
      if (memberDetails.headOfHousehold) {
        const { name, photoUrl } = memberDetails.headOfHousehold;
        if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      }
      if (memberDetails.spouse) {
        const { name, photoUrl } = memberDetails.spouse;
        if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      }
      if (memberDetails.householdInfo) {
        const { name, photoUrl } = memberDetails.householdInfo;
        if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      }
      memberDetails.otherHouseholdMembers.forEach(other => {
        const { name, photoUrl } = other;
        if (photoUrl) this.memberPhotos.push({ name, photoUrl });
      });

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
.xtabs, 
.xtabs * {
  text-align: left; 
}
</style>
