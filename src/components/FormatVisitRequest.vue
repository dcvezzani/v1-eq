<template>
  <div class="format-visit-request container">
		<p>
			FormatVisitRequest
		</p>

		<div class="select">
			<select @change="loadTemplate">
				<option v-for="template in templates">{{ template.name }}</option>
			</select>
		</div>
		<textarea v-model="contactMemberIdsRaw" class="textarea" placeholder="Copy member ids here, comma delim"></textarea>
		<div v-show="contactMemberIds.length > 0" class="select">
			<select @change="loadMember">
				<option v-for="member in contactMembers" :key="member.id" :value="member.id">{{ member.coupleName }}</option>
			</select>
		</div>
		<a @click="showTextCommandTemplate" class="button">Toggle text cmd</a>

		<textarea v-model="templateMessageContent" class="textarea" placeholder="Template content"></textarea>
		<textarea v-model="templateTextCommand" v-show="textCommandTemplateVisible" class="textarea" placeholder="Template text command"></textarea>

    <input type="radio" id="bro" v-model="personTitle" v-bind:value="personTitles.bro">
    <label for="bro">Bro.</label>
    <input type="radio" id="sis" v-model="personTitle" v-bind:value="personTitles.sis">
    <label for="sis">Sis.</label>

		<input v-model="lastname" class="input" type="text" placeholder="Last name: Smith">
		<input v-model="visitTime" class="input" type="text" placeholder="Visit time: 3pm">
		<input v-model="visitDate" class="input" type="text" placeholder="Visit date: 5/20">
		<input v-model="phone" class="input" type="text" placeholder="Phone: 2097569688">
		<input v-model="email" class="input" type="text" placeholder="Email: dave@email.com">
		<input v-model="subject" class="input" type="text" placeholder="Subject: Family visits">
		<input v-model="cc" class="input" type="text" placeholder="CC: pres@email.com">

		<button @click="generateContent" class="button is-primary"> Generate </button>
		<button @click="createNotes" class="button"> {{ (notesCreated) ? 'Created!' : 'Create Notes' }} </button>

		<textarea v-model="messageContent" class="textarea" placeholder="Generated message"></textarea>
		<textarea v-model="textCommand" class="textarea" placeholder="Generated text command"></textarea>
		<textarea v-model="emailCommand" class="textarea" placeholder="Generated email command"></textarea>

    <div class="actions columns">
      <div class="column">
        <button @click="sendText" class="button"> Text Now </button>
      </div>
      <div class="column">
        <button @click="sendEmail" class="button"> Email Now </button>
      </div>
      <div class="column">
        <button @click="sendMessage" class="button"> Text and Email Now </button>
      </div>
    </div>

  </div>
</template>

<script>
import messageTemplate from './../message-template.txt';
import messageTemplate02 from './../message-template-02.txt';
import messageTemplateImmediateFollowUp from './../message-template-immediate-follow-up.txt';
import messageTemplateSimpleHeadsUp from './../message-template-simple-heads-up.txt';
import messageTemplateFamiliarFollowup from './../message-template-familiar-followup.txt';
import messageTemplateBeforeSundayPPI from './../message-template-before-sunday-ppi.txt';
import textCommandTemplate from './../text-command-template.txt';
import emailCommandTemplate from './../email-command-template.txt';
import moment from 'moment';
import { createNotes } from './../fetch';

export default {
  name: 'FormatVisitRequest',
  props: ['name'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      personTitle: 'bro',
      personTitles: {bro: 'bro', sis: 'sis'}, 
      contactMemberIdsRaw: '',
      contactMembers: [], 
      currentMember: {},
			templateMessageContent: messageTemplate, 
			messageContent: '', 
			// lastname: 'Jones', 
			// visitTime: '2pm', 
			// visitDate: '7/29', 
			// phone: '7777777777', 
			// email: 'dave@gmail.com', 
			// subject: 'EQ Family Visits', 
			lastname: '', 
			visitTime: '', 
			visitDate: '', 
			phone: '', 
			email: '', 
			subject: '', 
			cc: '', 
			templateTextCommand: textCommandTemplate, 
			templateEmailCommand: emailCommandTemplate, 
			textCommand: '', 
			emailCommand: '', 
			templates: [
				{name: 'basic', content: messageTemplate}, 
				{name: 'alt-02', content: messageTemplate02}, 
				{name: 'immediate-follow-up', content: messageTemplateImmediateFollowUp}, 
				{name: 'simple-heads-up', content: messageTemplateSimpleHeadsUp}, 
				{name: 'familiar-followup', content: messageTemplateFamiliarFollowup}, 
				{name: 'ppi-before-sunday', content: messageTemplateBeforeSundayPPI}, 
			],
			textCommandTemplateVisible: false,
      notesCreated: false,
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    contactMemberIds: function() {
			return this.contactMemberIdsRaw.split(/\n/g).map(mid => mid.replace(/\"/g, ''));
		},
    formattedPersonTitle: function() {
      return (this.personTitle === 'bro') ? 'Bro.' : 'Sis.';
    },
    formattedDate: function() {
			if (this.visitDate == 'today') {
				return moment().format('dddd, MMM Do');
			} else {
				return moment(this.visitDate, '%M/%D').format('dddd, MMM Do');
			}
		},
    formattedTime: function() {
			return moment(this.visitTime, 'h:mma').format('h:mma');
		},
    cleanPhone: function() {
			return this.phone.replace(/[^0-9]+/g, '');
		},
  },
  methods: {
		loadMember: function(event) {
      const selectedMemberId = event.target.options[event.target.selectedIndex].value;
      this.currentMember = this.contactMembers.filter(member => member.id === parseInt(selectedMemberId))[0];
      console.log(">>>this.currentMember", this.currentMember)
		},
		showTextCommandTemplate: function() {
			this.textCommandTemplateVisible = !this.textCommandTemplateVisible;
		},
		createNotes: function() {
      createNotes((err, res) => {
        const self = this;
        if (err) return console.error(err);
        self.notesCreated = true;
        setTimeout(() => self.notesCreated = false, 2000);
      });
		},
		loadTemplate: function(event, ...args) {
			const templateName = event.target.selectedOptions[0].label;
			console.log(templateName);
			const selectedTemplate = this.templates.filter(template => template.name == templateName)[0];

			if (selectedTemplate) {
				this.templateMessageContent = selectedTemplate.content;
			} else {
				this.templateMessageContent = 'No template selected'
			}
		},
    generateContent: function() {
			this.generateMessage();
			this.generateTextCommand();
			this.generateEmailCommand();
		},
    sendText: function() {
			this.$socket.emit('sendText', {cmd: btoa(this.textCommand)});
		},
    sendEmail: function() {
			this.$socket.emit('sendEmail', {cmd: btoa(this.emailCommand)});
		},
    sendMessage: function() {
			this.$socket.emit('sendText', {cmd: btoa(this.textCommand)});
			this.$socket.emit('sendEmail', {cmd: btoa(this.emailCommand)});
		},
    generateMessage: function() {
			if (['lastname', 'visitTime', 'visitDate', 'formattedPersonTitle'].reduce((acc, attr) => (acc && this[attr].length > 0), true)) {
				this.messageContent = this.templateMessageContent.replace(/\$lastname/g, this.lastname)
				.replace(/\$title/g, this.formattedPersonTitle)
				.replace(/\$visitTime/g, this.formattedTime)
				.replace(/\$visitDate/g, this.formattedDate);
			} else {
				this.messageContent = "Missing fields";
			}
		},
    generateTextCommand: function() {
			if (['lastname', 'phone', 'messageContent', 'formattedPersonTitle'].reduce((acc, attr) => (acc && this[attr].length > 0), true) && this.messageContent != 'Missing fields') {
				this.textCommand = this.templateTextCommand.replace(/\$lastname/g, this.lastname)
				.replace(/\$title/g, this.formattedPersonTitle)
				.replace(/\$phone/g, this.cleanPhone)
				.replace(/\$msg/g, this.messageContent);
			} else {
				this.textCommand = "Missing fields";
			}
		},
    generateEmailCommand: function() {
			if (['lastname', 'email', 'messageContent', 'formattedPersonTitle', 'subject', 'cc'].reduce((acc, attr) => (acc && this[attr].length > 0), true) && this.messageContent != 'Missing fields') {
				this.emailCommand = this.templateEmailCommand.replace(/\$lastname/g, this.lastname)
				.replace(/\$title/g, this.formattedPersonTitle)
				.replace(/\$email/g, this.email)
				.replace(/\$cc/g, this.cc)
				.replace(/\$subject/g, this.subject)
				.replace(/\$msg/g, this.messageContent);
			} else {
				this.emailCommand = "Missing fields";
			}
		},
    junk: function() {
		},
  },
  sockets:{
    "FormatVisitRequest:blah": function(data){
		  console.log('FormatVisitRequest:blah', data);
			this.$socket.emit('FormatVisitRequest:blah', {msg: 'bleh'});
    },
    "sendShellCommand:text:done": function(err, data){
		  console.log('sendShellCommand:text:done', err, data);
    },
    "sendShellCommand:email:done": function(err, data){
		  console.log('sendShellCommand:email:done', err, data);
    },
    "db:wardMembers:fetch:done": function(data){
		  console.log('db:wardMembers:fetch:done', data);
      this.contactMembers = data.responsePayload;
      this.currentMember = this.contactMembers[0];
    },
  },
  mounted () {
		window.Event.$on('FormatVisitRequest:activate', (data) => {
		  console.log('FormatVisitRequest:blah', data);
			window.Event.$emit('FormatVisitRequest:activated', {msg: 'done'});
		});
  },
  watch: {
    contactMemberIds: function (newValue, oldValue) {
			this.$socket.emit('db:wardMembers:fetch', {memberIds: this.contactMemberIds});
    },

    currentMember: function (newValue, oldValue) {
			this.lastname = newValue.headOfHouse_surname;
			this.phone = newValue.phone;
			this.email = newValue.email;
			this.personTitle = (newValue.headOfHouse_gender === 'MALE') ? 'bro' : 'sis';
			this.lastname = newValue.headOfHouse_surname;
    },

		// <input v-model="lastname" class="input" type="text" placeholder="Last name: Smith">
		// <input v-model="visitTime" class="input" type="text" placeholder="Visit time: 3pm">
		// <input v-model="visitDate" class="input" type="text" placeholder="Visit date: 5/20">
		// <input v-model="phone" class="input" type="text" placeholder="Phone: 2097569688">
		// <input v-model="email" class="input" type="text" placeholder="Email: dave@email.com">
		// <input v-model="subject" class="input" type="text" placeholder="Subject: Family visits">
		// <input v-model="cc" class="input" type="text" placeholder="CC: pres@email.com">
    
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.actions {
  margin-top: 1em; 
}
</style>

