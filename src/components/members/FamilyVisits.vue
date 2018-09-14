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
              <div class="column">{{memberName(member)}}</div>
              <div class="column">{{member.phone}}</div>
              <div class="column">{{member.email}}</div>
              <div class="column">{{(member.address || '').replace(/ undefined/, '')}}</div>
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
        <td>{{memberName(member)}}</td>
        <td>{{member.phone}}</td>
        <td>{{member.email}}</td>
        <td>{{(member.address || '').replace(/ undefined/, '')}}</td>
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
    memberName: function(member) {
      return member.name || member.coupleName
		},
    memberAssignment: function(idx) {
			return {columns: true, altColor: (idx % 2 === 0)};
		},
    renderView: function() {
      const tags = _.uniq(this.members.map(member => member.tag_name)).sort()
      console.log(">>>tags", tags);

      let curDate = moment().day(moment().localeData().firstDayOfWeek());
      this.dates = _.range(0,30).map(idx => {

        const theDate = curDate.add(7, 'days').format('MMM DD, YYYY');
        if (idx > tags.length) return { theDate };

        const taggedMembers = this.members.filter(member => tags[idx] === member.tag_name)
        return { theDate, taggedMembers };
      });
    },
  },
  sockets:{
    "FamilyVisits:blah": function(data){
		  console.log('FamilyVisits:blah', data);
			this.$socket.emit('FamilyVisits:blah', {msg: 'bleh'});
    },
    "db:wardMembers:fetchFamilies:done": function({ responsePayload }){
		  console.log('db:wardMembers:fetchFamilies:done', responsePayload);
      // this.members = responsePayload.map(member => ({...member, name: member.coupleName, email: '', phone: ''}));
      this.members = responsePayload;
      this.renderView();
    },

    
    "db:tags:fetchMembers:done": function({ responsePayload }){
		  console.log('db:tags:fetchMembers:done', responsePayload);
      this.members = responsePayload;
      this.renderView();
    },
    "db:wardMembers:fetchFamiliesNotVisited:done": function({ responsePayload }){
		  console.log('db:tags:fetchMembers:done', responsePayload);
      this.members = responsePayload;
      this.renderView();
    },
  },
  mounted () {
		window.Event.$on('FamilyVisits:activate', (data) => {
		  console.log('FamilyVisits:blah', data);
			window.Event.$emit('FamilyVisits:activated', {msg: 'done'});
		});
		// this.$socket.emit('db:wardMembers:fetchFamilies');
    this.$socket.emit('db:wardMembers:fetchFamiliesNotVisited');
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

