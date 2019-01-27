<template>
  <div class="districts">
    <div class="content">
      <h2 class="title"> Vineyard 1st Ward EQ proposed district changes </h2>
      <p>As of {{currentDate}}</p>
      
      <ul class="overview">
        <li>attempts were made to group companions and families together by geographic location and age</li>
        <li>existing ministering assignments kept intact</li>
        <li>every elder has a companion</li>
        <li>every companionship has at least 2 families to minister to</li>
        <li>this proposal should provide a nice starting place from which changes can be made</li>
      </ul>
    </div>

    <District v-for="districtName in districtNames" :key="districtName" :title="districtName" :assignments="all_districts.assignments[districtName]" :remaining="remainingAssignments(districtName)" :showPhone="false" :showEmail="false" :showId="true"></District>

  </div>
</template>

<script>
/*
    <District v-for="districtName in districtNames" :key="districtName" :title="districtName" :assignments="districtName"></District>
    <District title="District 1" :assignments="district_01"></District>
    <District title="District 2" :assignments="district_02"></District>
    <District title="District 3" :assignments="district_03"></District>

*/
import moment from 'moment';

import district_01 from '../../../be/district-01.json'
import district_02 from '../../../be/district-02.json'
import district_03 from '../../../be/district-03.json'
import all_districts from '../../../be/district-assignments-eq.json'
import District from '@/components/members/District'

export default {
  components: {District},
  name: 'Districts',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App', 
      // district_01: district_01, 
      // district_02: district_02, 
      // district_03: district_03, 

      // const districtNames = ['hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'];
      
      hackberry: all_districts.assignments['hackberry'], 
      serrata: all_districts.assignments['serrata'], 
      samara: all_districts.assignments['samara'], 
      syracuse: all_districts.assignments['syracuse'], 

      sterling_loop: all_districts.assignments['sterling-loop'], 
      dry_creek: all_districts.assignments['dry-creek'], 
      silver_oak: all_districts.assignments['silver-oak'], 
      quivira: all_districts.assignments['quivira'], 

      alloy_m: all_districts.assignments['alloy-m'], 
      alloy_n: all_districts.assignments['alloy-n'], 
      alloy_p: all_districts.assignments['alloy-p'], 
      alloy_q: all_districts.assignments['alloy-q'], 

      other_neighborhoods: all_districts.assignments['other-neighborhoods'], 
      all_districts,
    }
  },
  computed: {
    districtNames: function(){
      return Object.keys(this.all_districts.assignments) //.map(a => a.replace(/-/g, '_'))
    },
    currentDate: function() {
			return moment().format('MMM DD, YYYY');
		},
  },
  methods: {
    remainingAssignments: function(districtName){
      return {ministers: all_districts.ministers[districtName], families: all_districts.families[districtName]}
    },
  },
  mounted () {
      // console.log(">>>", Object.keys(this.all_districts.assignments).map(a => a.replace(/-/g, '_')))
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #42b983;
}
.column ul, 
ul.overview {
text-align: left;
}

ul.overview {
padding-left: 30px;
}

ul.overview, 
.district-assignments {
  width: 800px;
  margin: 0 auto;
}
.address {
  font-size: 8pt; 
}
.person {
  margin-bottom: 5px;
}
h2 {
  display: block;
  font-size: 18pt;
  font-weight: bold;
  margin: 25px 0 10px 0;
}
</style>
