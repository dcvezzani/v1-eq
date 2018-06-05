<template>
  <div class="member">
		{{ name }}: {{ validPhone }}, {{ validEmail }}
  </div>
</template>

<script>
export default {
  name: 'Member',
  props: ['attrs'],
  // components: { Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			fields: ['actualAge', 'address', 'birthDate', 'email', 'genderLabelShort', 'group', 'householdEmail', 'householdPhone', 'id', 'name', 'nonMember', 'phone', 'visible'],
			actualAge: null,
			address: null,
			birthDate: null,
			email: null,
			genderLabelShort: null,
			group: null,
			householdEmail: null,
			householdPhone: null,
			id: null,
			name: null,
			nonMember: null,
			phone: null,
			visible: null,
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
		validPhone: function() {
			return this.phone || this.householdPhone;
		},
		validEmail: function() {
			return this.email || this.householdEmail;
		},
  },
  methods: {
    junk: function() {
		},
  },
  sockets:{
    "Member:blah": function(data){
		  console.log('Member:blah', data);
			this.$socket.emit('Member:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('Member:activate', (data) => {
		  console.log('Member:blah', data);
			window.Event.$emit('Member:activated', {msg: 'done'});
		});

		this.fields.forEach(field => this[field] = this.attrs[field]);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

