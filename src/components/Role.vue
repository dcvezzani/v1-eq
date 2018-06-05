<template>
  <div class="role">
		{{ name }}: {{ description }}
  </div>
</template>

<script>
export default {
  name: 'Role',
  props: ['attrs'],
  // components: { Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			fields: ['name', 'description'],
			name: null,
			description: null,
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
  },
  sockets:{
    "Role:blah": function(data){
		  console.log('Role:blah', data);
			this.$socket.emit('Role:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('Role:activate', (data) => {
		  console.log('Role:blah', data);
			window.Event.$emit('Role:activated', {msg: 'done'});
		});

		this.fields.forEach(field => this[field] = this.attrs[field]);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

