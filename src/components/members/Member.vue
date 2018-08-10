<template>
  <li class="member is-left">
    <div class="field">
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="checked">
          {{ member.name }}
        </label>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'Member',
  props: ['member'],
  // components: { Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      checked: false,
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
    "Member:blah": function(data){
		  console.log('Member:blah', data);
			this.$socket.emit('Member:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('Member:viewUpdate', () => this.checked = (this.member.selected === true));
		// window.Event.$on('Member:selectMember', () => this.checked = true);
		// window.Event.$on('Member:unselectMember', () => this.checked = false);
  },

  watch: {
    checked: function (newValue, oldValue) {
      this.$emit('checked', {checked: newValue, memberId: this.member.id})
    }
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

