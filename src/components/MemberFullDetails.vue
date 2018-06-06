<template>
  <div id="member-full-details" class="container member-full-details">
		<div class="contact-details">
			<h3>Details</h3>
			<div class="table-wrapper">
				<table>
					<tr v-for="attr in member" :key="attr.key">
						<td>{{ attr.key }}</td>
						<td>{{ attr.value }}</td>
					</tr>
				</table>
			</div>
		</div>

		<div class="section visits">
			<div class=" visit-controls">
				<h3>Visits</h3>
				<div v-if="inVisitQueue !== null">Already in visit queue for {{ inVisitQueue }}</div>
				<div v-else>
					<p>Add to Visit Queue</p>
					<div class="columns">
						<div class="column">
							Weeks: <div class="field"><div class="control"><input ref="weeksUntilVisit" class="input " type="text" placeholder="Weeks"></div></div>
						</div>
						<div class="column">
							Months: <div class="field"><div class="control"><input ref="monthsUntilVisit" class="input " type="text" placeholder="Months"></div></div>
						</div>
					</div>
					<a class="button is-primary">Add to Visit Queue</a>
				</div>
			</div>
			<div class=" visit-history">
				<h3>Visit History</h3>
				<ul>
					<li v-for="visit in visitHistory" :key="visit.id">{{ JSON.stringify(visit) }}</li>
				</ul>

			</div>
		</div>

  </div>
</template>

<script>
export default {
  name: 'MemberFullDetails',
  props: ['data'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			xinVisitQueue: '12 Jul 2018',
			inVisitQueue: null,
			visitHistory: [
				{id: 1, date: '13 Mar 2018', vistors: 'JT,RS', purpose: 'quarterly companionship'}, 
				{id: 2, date: '14 Mar 2018', vistors: 'JT,RS', purpose: 'quarterly companionship'}, 
				{id: 3, date: '15 Mar 2018', vistors: 'JT,RS', purpose: 'personal'}, 
				{id: 4, date: '16 Mar 2018', vistors: 'JT,RS', purpose: 'quarterly companionship'}, 
			]
    }
  },
  computed: {
    stuff: function() {
			return 'stuff';
		},
    name: function() {
			return (this.data) ? this.data.name : "n/a"; 
		},
    memberDump: function() {
			// return (this.data) ? JSON.stringify(this.data) : "n/a"; 
			return (this.data) ? Object.keys(this.data).map(key => ([key, this.data[key]])) : "n/a"; 
		},
    member: function() {
			const attrNames = [ 'name', 'address', 'email', 'phone', 'birthDate', 'gender', ];
			// const attrNames = [ 'name', 'address', 'email', 'phone', 'birthDate', 'actualAge', 'gender', ];
			return (this.data) ? attrNames.map(attr => ({key: attr, value: this.data[attr]})) : "n/a"; 
			// return (this.data) ? attrNames.map(attr => (`${attr}: ${this.data[attr]}`)) : "n/a"; 
		},
  },
  methods: {
    junk: function() {
		},
  },
  sockets:{
    "MemberFullDetails:blah": function(data){
		  console.log('MemberFullDetails:blah', data);
			this.$socket.emit('MemberFullDetails:blah', {msg: 'bleh'});
    },
  },
  mounted () {
		window.Event.$on('MemberFullDetails:activate', (data) => {
		  console.log('MemberFullDetails:blah', data);
			window.Event.$emit('MemberFullDetails:activated', {msg: 'done'});
		});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.contact-details {
	margin-top: 2em;
}
.table-wrapper {
	width: 480px;
	margin: 0 auto;
	padding: 15px;
	box-shadow: 0 2px 4px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
}
.table-wrapper table {
}
.table-wrapper td {
	padding-left: 1em;
}
.table-wrapper td:first-child {
	padding-left: 0;
}

#member-full-details ul {
	text-align: left;
}
#member-full-details li {
	list-style: disc;
}

.visits {
	width: 70%;
	margin: 0 auto;
}

.visit-history {
	margin: 0 auto;
	margin-top: 2em;
}
#member-full-details .visit-history ul {
	position: relative;
	left: 30px;
}
.button-spacer {
	display: inline-block;
	width: 10px;
}
h3 {
	font-size: 18pt;
	font-weight: bold;
}
</style>

