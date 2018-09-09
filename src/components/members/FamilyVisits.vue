<template>
  <div class="family-visits section">
    <h2 class="title"> Vineyard 1st Ward Family Visits </h2>
    
    <p>Show:</p>
    <div class="field is-grouped is-grouped-centered">
      <div class="control">
        <label class="radio">
          <input type="radio" name="question" value="pretty" v-model="viewMode">
          Pretty
        </label>
        <label class="radio">
          <input type="radio" name="question" value="table" v-model="viewMode">
          Table
        </label>
      </div>
    </div>

    <ul v-show="viewMode === 'pretty'" class="assignments">
      <li class="assignment" v-for="({ theDate, taggedMembers }, index) in dates" :key="index">
        <p class="date">{{theDate}}</p>
        <ul>
          <div class="member" v-for="( member, idx ) in taggedMembers" :key="member.id">
            <div :class="memberAssignment(idx)">
              <div class="column">{{member.name}}</div>
              <div class="column">{{member.phone}}</div>
              <div class="column">{{member.email}}</div>
            </div>
          </div>
        </ul>
      </li>
    </ul>

    <table v-show="viewMode === 'table'" v-for="({ theDate, taggedMembers }, index) in dates" :key="index">
      <tr>
        <td>{{theDate}}</td>
      </tr>

      <tr v-for="( member, idx ) in taggedMembers" :key="member.id">
        <td></td>
        <td>{{member.name}}</td>
        <td>{{member.phone}}</td>
        <td>{{member.email}}</td>
      </tr>

      <tr>
        <td>&nbsp;</td>
      </tr>
    </table>
  </div>

  </div>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'FamilyVisits',
  props: ['name'],
  // components: { Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      members: [],
      dates: [],
      viewMode: 'pretty',
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
    memberAssignment: function(idx) {
			return {columns: true, altColor: (idx % 2 === 0)};
		},
  },
  sockets:{
    "FamilyVisits:blah": function(data){
		  console.log('FamilyVisits:blah', data);
			this.$socket.emit('FamilyVisits:blah', {msg: 'bleh'});
    },
    "db:tags:fetchMembers:done": function({ responsePayload }){
		  console.log('db:tags:fetchMembers:done', responsePayload);
      this.members = responsePayload;

      const tags = _.uniq(this.members.map(member => member.tag_name)).sort()

      let curDate = moment().day(moment().localeData().firstDayOfWeek());
      this.dates = _.range(0,30).map(idx => {

        const theDate = curDate.add(7, 'days').format('MMM DD, YYYY');
        if (idx > tags.length) return { theDate };

        const taggedMembers = this.members.filter(member => tags[idx] === member.tag_name)
        return { theDate, taggedMembers };
      });
    },
  },
  mounted () {
		window.Event.$on('FamilyVisits:activate', (data) => {
		  console.log('FamilyVisits:blah', data);
			window.Event.$emit('FamilyVisits:activated', {msg: 'done'});
		});
		this.$socket.emit('db:tags:fetchMembers', {pattern: 'family-visits-'});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul li.assignment {
  margin: 2em 0;
  padding-bottom: 1em;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
}
ul.assignments .member .columns {
  margin: 0 1em;
}
ul.assignments .member .column {
  text-align: left;
}
ul.assignments p.date {
  font-size: 14pt;
  font-weight: bold;
  margin: 1em 0;
  padding: 1em 0;
  background-color: rgba(0,0,0,0.12);
}
.altColor {
  background-color: rgba(0,0,0,0.05);
}
</style>

