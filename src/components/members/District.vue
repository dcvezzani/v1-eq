<template>
  <div class="district">
    <div class="district-assignments">
      <h2>{{ title }}</h2>
      <div class="columns" v-for="(assignment, index) in assignments">
        <div :class="assignmentRow(index)">
          <ul>
            <li v-for="person in assignment.ministers" :class="ministerStyle(person)">{{ person.name }} {{ person.assign_id }} <span class="age">({{ person.age }})</span> <div class="address">{{ person.address }}</div> <div class="member-id" v-show="showPhone">{{ person.phone }}</div> <div class="member-id" v-show="showEmail">{{ person.email }}</div> <div class="member-id" v-show="showId">{{ person.id }}</div> </li>
          </ul>
          <div v-if="remaining.ministers">
            <a @click="toggleRemainingMinistersState" v-show="index === assignments.length-1 && remainingMinistersState === 'closed' && remaining.ministers.length > 0" href="">Show Remaining</a>
            <a @click="toggleRemainingMinistersState" v-show="index === assignments.length-1 && remainingMinistersState === 'open' && remaining.ministers.length > 0" href="">Hide Remaining</a>
            <ul class="remaining" v-show="index === assignments.length-1 && remainingMinistersState === 'open'">
              <li v-for="person in remaining.ministers" :class="remainingStyle(person)">{{ person.name }} <span class="age">({{ person.age }})</span> <div class="address">{{ person.address }}</div> <div class="member-id" v-show="showPhone">{{ person.phone }}</div> <div class="member-id" v-show="showEmail">{{ person.email }}</div> <div class="member-id" v-show="showId">{{ person.id }}</div> </li>
            </ul>
          </div>
        </div>
        <div :class="assignmentRow(index)">
          <ul>
            <li v-for="person in assignment.families" :class="familyStyle(person)">{{ person.name }} {{ person.assign_id }} <span class="age" v-show="person.age">({{ person.age }})</span> <div class="address">{{ person.address }}</div> <div class="member-id" v-show="showPhone">{{ person.phone }}</div> <div class="member-id" v-show="showEmail">{{ person.email }}</div> <div class="member-id" v-show="showId">{{ person.id }}</div> </li>
          </ul>
          <div v-if="remaining.families">
            <a @click="toggleRemainingFamiliesState" v-show="index === assignments.length-1 && remainingFamiliesState === 'closed' && remaining.families.length > 0" href="">Show Remaining</a>
            <a @click="toggleRemainingFamiliesState" v-show="index === assignments.length-1 && remainingFamiliesState === 'open' && remaining.families.length > 0" href="">Hide Remaining</a>
            <ul class="remaining" v-show="index === assignments.length-1 && remainingFamiliesState === 'open'">
              <li v-for="person in remaining.families" :class="remainingStyle(person)">{{ person.name }} <span class="age">({{ person.age }})</span> <div class="address">{{ person.address }}</div> <div class="member-id" v-show="showPhone">{{ person.phone }}</div> <div class="member-id" v-show="showEmail">{{ person.email }}</div> <div class="member-id" v-show="showId">{{ person.id }}</div> </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'assignments', 'remaining', 'showId', 'showPhone', 'showEmail'], 
  components: {},
  name: 'District',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App', 
      remainingMinistersState: 'closed',
      remainingFamiliesState: 'closed',
    }
  }, 
  methods: {
    assignmentRow: function(index) {
      return ['column', (index % 2 === 0) ? 'gray' : '']
    },
    ministerStyle: function(person) {
      return ['person', 'minister', person.added ? 'added' : '']
    }, 
    familyStyle: function(person) {
      return ['person', 'family', person.added ? 'added' : '']
    }, 
    remainingStyle: function(person) {
      return ['person', 'remaining']
    }, 
    toggleRemainingMinistersState: function(event) {
      event.preventDefault();
      this.remainingMinistersState = (this.remainingMinistersState === 'open') ? 'closed' : 'open'
    }, 
    toggleRemainingFamiliesState: function(event) {
      event.preventDefault();
      this.remainingFamiliesState = (this.remainingFamiliesState === 'open') ? 'closed' : 'open'
    }, 
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #42b983;
}
.column ul {
text-align: left;
}
.column ul li {
  display: block; 
}
.column.gray {
  background-color: whitesmoke;
}

.district-assignments {
  width: 800px;
  margin: 0 auto;
}
.address {
  font-size: 8pt; 
}
.member-id {
  font-size: 8pt; 
}

.remaining {
  margin-top: 10px;
}
.person {
  margin-bottom: 5px;
}
.person.minister.added {
  background-color: yellow;
}
.person.family.added {
  background-color: blue;
  color: white;
}
.person.remaining {
  font-size: 10pt;
  font-style: italic;
  color: gray;
}
h2 {
  display: block;
  font-size: 18pt;
  font-weight: bold;
  margin: 25px 0 10px 0;
}
</style>
