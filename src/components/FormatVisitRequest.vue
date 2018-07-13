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
		<a @click="showTextCommandTemplate" class="button">Toggle text cmd</a>

		<textarea v-model="templateMessageContent" class="textarea" placeholder="Template content"></textarea>
		<textarea v-model="templateTextCommand" v-show="textCommandTemplateVisible" class="textarea" placeholder="Template text command"></textarea>

		<input v-model="lastname" class="input" type="text" placeholder="E.g., Smith">
		<input v-model="visitTime" class="input" type="text" placeholder="E.g., 3pm">
		<input v-model="visitDate" class="input" type="text" placeholder="E.g., 5/20">
		<input v-model="phone" class="input" type="text" placeholder="E.g., 2097569688">

		<button @click="generateContent" class="button"> Generate </button>

		<textarea v-model="messageContent" class="textarea" placeholder="Generated message"></textarea>
		<textarea v-model="textCommand" class="textarea" placeholder="Generated text command"></textarea>
  </div>
</template>

<script>
import messageTemplate from './../message-template.txt';
import messageTemplateFamiliarFollowup from './../message-template-familiar-followup.txt';
import messageTemplateBeforeSundayPPI from './../message-template-before-sunday-ppi.txt';
import textCommandTemplate from './../text-command-template.txt';
import moment from 'moment';

export default {
  name: 'FormatVisitRequest',
  props: ['name'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			templateMessageContent: messageTemplate, 
			messageContent: '', 
			lastname: '', 
			visitTime: '', 
			visitDate: '', 
			phone: '', 
			templateTextCommand: textCommandTemplate, 
			textCommand: '', 
			templates: [
				{name: 'basic', content: messageTemplate}, 
				{name: 'familiar-followup', content: messageTemplateFamiliarFollowup}, 
				{name: 'ppi-before-sunday', content: messageTemplateBeforeSundayPPI}, 
			],
			textCommandTemplateVisible: false,
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
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
		showTextCommandTemplate: function() {
			this.textCommandTemplateVisible = !this.textCommandTemplateVisible;
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
		},
    generateMessage: function() {
			if (['lastname', 'visitTime', 'visitDate'].reduce((acc, attr) => this[attr].length > 0, true)) {
				this.messageContent = this.templateMessageContent.replace(/\$lastname/g, this.lastname)
				.replace(/\$visitTime/g, this.formattedTime)
				.replace(/\$visitDate/g, this.formattedDate);
			} else {
				this.messageContent = "Missing fields";
			}
		},
    generateTextCommand: function() {
			if (['lastname', 'phone', 'messageContent'].reduce((acc, attr) => this[attr].length > 0, true) && this.messageContent != 'Missing fields') {
				this.textCommand = this.templateTextCommand.replace(/\$lastname/g, this.lastname)
				.replace(/\$phone/g, this.cleanPhone)
				.replace(/\$msg/g, this.messageContent);
			} else {
				this.textCommand = "Missing fields";
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
  },
  mounted () {
		window.Event.$on('FormatVisitRequest:activate', (data) => {
		  console.log('FormatVisitRequest:blah', data);
			window.Event.$emit('FormatVisitRequest:activated', {msg: 'done'});
		});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

