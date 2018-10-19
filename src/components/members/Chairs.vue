<template>
  <div class="chairs section">
    <h2 class="title"> {{title}} </h2>
    
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

    <ul v-show="viewMode === 'pretty'" class="chair-assignments">
      <li class="chair-assignment" v-for="({ theDate, taggedMembers }, index) in dates" :key="index">
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
</template>

<script>
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'Chairs',
  props: ['name'],
  // components: { Junk },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      title: "Vineyard 1st Ward Chair Assignments",
      xtitle: "Vineyard 1st Ward Move-In Volunteers",
      members: [],
      dates: [],
      viewMode: 'pretty',
      // viewMode: 'table',
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
    "Chairs:blah": function(data){
		  console.log('Chairs:blah', data);
			this.$socket.emit('Chairs:blah', {msg: 'bleh'});
    },
    "db:members:fetchFamilies:done": function({ responsePayload }){
		  console.log('db:members:fetchFamilies:done', responsePayload);
      this.members = responsePayload;
    },
    "db:tags:fetchMembers:done": function({ responsePayload }){
		  console.log('db:tags:fetchMembers:done', responsePayload);
      this.members = responsePayload;

      const tags = _.uniq(this.members.map(member => member.tag_name)).sort()

      // let curDate = moment().day(7);
      // start 7 days prior to desired start date
      let curDate = moment('9/9/2018');
      // curDate = moment('10/13/2018');
      this.dates = _.range(0,30).map(idx => {

        const theDate = curDate.add(7, 'days').format('MMM DD, YYYY');
        if (idx > tags.length) return { theDate };

        const taggedMembers = this.members.filter(member => tags[idx] === member.tag_name)
        return { theDate, taggedMembers };
      });
    },
  },
  mounted () {
		window.Event.$on('Chairs:activate', (data) => {
		  console.log('Chairs:blah', data);
			window.Event.$emit('Chairs:activated', {msg: 'done'});
		});
		this.$socket.emit('db:tags:fetchMembers', {pattern: 'chairs-'});
		// this.$socket.emit('db:tags:fetchMembers', {pattern: 'move-in-'});
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul li.chair-assignment {
  margin: 2em 0;
  padding-bottom: 1em;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
}
ul.chair-assignments .member .columns {
  margin: 0 1em;
}
ul.chair-assignments .member .column {
  text-align: left;
}
ul.chair-assignments p.date {
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

