/*
node_modules/.bin/babel-node minist-assigns.js
*/
import db from './db'
import _ from 'lodash'

/*
const assignments = [
  [3490995727,3559109763,3490995727,672161638], 
  [643707720,672161638,3050293235,7855441019], 
  [19681208225,6392601365,2024598596,3699599140], 
  [21122612581,2024598596,1979369783,643707720], 
  [1419983803,3699599140,1065891475,19681208225], 
  [1598979256,1979369783,2586925712,5825625642], 
  [7855441019,2586925712,1419983803,5636786427], 
  [5636786427,1460140336,3822968589,1598979256], 
  [1598983188,1369421232,1598983188,1369421232], 
  [1922486522,1160367605,1922486522,409263203], 
  [34366232446,1042936459,909426382,34366232446], 
  [3560941092,2340594759,1042936459,3560941092], 
  [999039611,2352006406,2340594759,999039611], 
  [2143329268,3360534916,2352006406,2143329268], 
  [24701515049,5763227751,3360534916,24701515049], 
  [2279031435,1208811811,5763227751,2279031435], 
  [5712568846,2013838678,1208811811,5712568846], 
  [5701426541,1038268192,2013838678,5701426541], 
  [7847903375,5656381549,1038268192,7847903375], 
  [1920508726,3365648482,5656381549,1920508726], 
  [2537419866,2193685409,3365648482,2537419866], 
  [642564491,2891153399,2193685409,642564491], 
  [3377159412,2675804640,2891153399,3377159412], 
  [3224000148,20800068655,2675804640,3224000148], 
  [3695204147,2222157021,20800068655,3695204147], 
  [3349139980,3038082409,2222157021,3349139980], 
  [1920191217,2013510356,3038082409,1920191217], 
  [5791645298,5235180794,2013510356,5791645298], 
  [945992016,6088831756,5235180794,945992016], 
  [2045101027,3710124121,1529937268,20482691377], 
  [5629239936,5703271632,3710124121,11116842351,6405311555], 
  [2343826863,5766759670,20034979112,19702571764], 
  [3858901171,20801949134,5766759670,5764893936], 
  [3042615022,8339579332,533410205,3858901171], 
  [3694966261,3562771438,20801949134,1529940217,3776791181], 
  [1532048752,5552310356,6469630228,3754931227], 
  [947199140,3776791181,3042615022,1040642137], 
  [6405311555,1493201575,1432206425,3562771438,1493201575], 
]

const invalidAssignments = [
  [ 1598983188, 1369421232, 1598983188, 1369421232 ],
  [ 1922486522, 1160367605, 1922486522, 409263203 ],
  [ 34366232446, 1042936459, 909426382, 34366232446 ],
  [ 3560941092, 2340594759, 1042936459, 3560941092 ],
  [ 999039611, 2352006406, 2340594759, 999039611 ],
  [ 2143329268, 3360534916, 2352006406, 2143329268 ],
  [ 24701515049, 5763227751, 3360534916, 24701515049 ],
  [ 2279031435, 1208811811, 5763227751, 2279031435 ],
  [ 5712568846, 2013838678, 1208811811, 5712568846 ],
  [ 5701426541, 1038268192, 2013838678, 5701426541 ],
  [ 7847903375, 5656381549, 1038268192, 7847903375 ],
  [ 1920508726, 3365648482, 5656381549, 1920508726 ],
  [ 2537419866, 2193685409, 3365648482, 2537419866 ],
  [ 642564491, 2891153399, 2193685409, 642564491 ],
  [ 3377159412, 2675804640, 2891153399, 3377159412 ],
  [ 3224000148, 20800068655, 2675804640, 3224000148 ],
  [ 3695204147, 2222157021, 20800068655, 3695204147 ],
  [ 3349139980, 3038082409, 2222157021, 3349139980 ],
  [ 1920191217, 2013510356, 3038082409, 1920191217 ],
  [ 5791645298, 5235180794, 2013510356, 5791645298 ],
  [ 945992016, 6088831756, 5235180794, 945992016 ],
]
*/

/*
[
  [ 1598983188, 1369421232, 1922486522, 409263203 ],
  [ 1922486522, 1160367605, 909426382, 34366232446 ],
  [ 34366232446, 1042936459, 3560941092, 2340594759 ],
  [ 3560941092, 2340594759, 999039611, 2352006406 ],
  [ 999039611, 2352006406, 2143329268, 3360534916 ],
  [ 2143329268, 3360534916, 24701515049, 5763227751 ],
  [ 24701515049, 5763227751, 2279031435, 1208811811 ],
  [ 2279031435, 1208811811, 5712568846, 2013838678 ],
  [ 5712568846, 2013838678, 5701426541, 1038268192 ],
  [ 5701426541, 1038268192, 7847903375, 5656381549 ],
  [ 7847903375, 5656381549, 1920508726, 3365648482 ],
  [ 1920508726, 3365648482, 2537419866, 2193685409 ],
  [ 2537419866, 2193685409, 642564491, 2891153399 ],
  [ 642564491, 2891153399, 3377159412, 2675804640 ],
  [ 3377159412, 2675804640, 3224000148, 20800068655 ],
  [ 3224000148, 20800068655, 3695204147, 2222157021 ],
  [ 3695204147, 2222157021, 3349139980, 3038082409 ],
  [ 3349139980, 3038082409, 1920191217, 2013510356 ],
  [ 1920191217, 2013510356, 5791645298, 5235180794 ],
  [ 5791645298, 5235180794, 945992016, 6088831756 ],
]

Validation error [ 1598983188, 1369421232, 1598983188, 1369421232 ]
Validation error [ 1922486522, 1160367605, 1922486522, 409263203 ]
Validation error [ 34366232446, 1042936459, 909426382, 34366232446 ]
Validation error [ 3560941092, 2340594759, 1042936459, 3560941092 ]
Validation error [ 999039611, 2352006406, 2340594759, 999039611 ]
Validation error [ 2143329268, 3360534916, 2352006406, 2143329268 ]
Validation error [ 24701515049, 5763227751, 3360534916, 24701515049 ]
Validation error [ 2279031435, 1208811811, 5763227751, 2279031435 ]
Validation error [ 5712568846, 2013838678, 1208811811, 5712568846 ]
Validation error [ 5701426541, 1038268192, 2013838678, 5701426541 ]
Validation error [ 7847903375, 5656381549, 1038268192, 7847903375 ]
Validation error [ 1920508726, 3365648482, 5656381549, 1920508726 ]
Validation error [ 2537419866, 2193685409, 3365648482, 2537419866 ]
Validation error [ 642564491, 2891153399, 2193685409, 642564491 ]
Validation error [ 3377159412, 2675804640, 2891153399, 3377159412 ]
Validation error [ 3224000148, 20800068655, 2675804640, 3224000148 ]
Validation error [ 3695204147, 2222157021, 20800068655, 3695204147 ]
Validation error [ 3349139980, 3038082409, 2222157021, 3349139980 ]
Validation error [ 1920191217, 2013510356, 3038082409, 1920191217 ]
Validation error [ 5791645298, 5235180794, 2013510356, 5791645298 ]
Validation error [ 945992016, 6088831756, 5235180794, 945992016 ]
*/

/*
const validAssignments = []
const familyIds = []
const invalidIdx = []
assignments.forEach((assignment, idx) => {
  const ministeringBrothers = assignment.slice(0,2);
  const assignedFamilies = assignment.slice(2, assignment.length);

  const uniqAssignment = _.uniq(assignment);
  if (uniqAssignment.length == assignment.length) {
    validAssignments.push(assignment);
  } else {
    console.log("Validation error", assignment);
    invalidIds = assignedFamilies.filter(family => ministeringBrothers.include(family))

    if (invalidIds.length > 0 && invalidIdx.length > 0) {
      invalidIx.forEach(idx => {
        if (validAssignments[idx].length < 2)
      })
    }

    invalidIdx.push(idx)
    validAssignments.push(_.difference(assignedFamilies, invalidIds))
  }
})

let asdf = () => {
  let families = _.flatten(invalidAssignments.map(assign => assign.slice(2, assign.length)))
  // console.log(">>>families", _.flatten(families));

  const newAssignments = invalidAssignments.map(assign => {
    const newAssignment = assign.slice(0, 2);
    let family = null
    for (let idx=0; idx<families.length && newAssignment.length < 4; idx++) {
      family = families[idx]
      console.log(">>>family", family)
      if (!newAssignment.includes(family)) {
        newAssignment.push(family)
      }
      if (newAssignment.length > 3) {
        families = _.difference(families, newAssignment)
        break;
      }
      console.log("idx", idx);
    }
    return newAssignment
  })

  console.log(">>>newAssignments", newAssignments)
}

const renderAssignments = () => {
  assignments.forEach((assignment, idx) => {
    const ministeringBrothers = assignment.slice(0,2);
    const assignedFamilies = assignment.slice(2, assignment.length);

    const uniqAssignment = _.uniq(assignment);
    if (uniqAssignment.length != assignment.length) {
      console.log("Validation error", assignment);
      return;
    }

    let query = db.raw(`select id, name, replace(address, '<br />', ' ') address from members where id in (${ministeringBrothers.join(",")})`);
    console.log("query.toString()", query.toString());

    query//.orderBy('coupleName', 'asc')
    .asCallback((err, ministeringBrothers) => {
      if (err) return console.log({msg: 'Unable to fetch records', raw: err, query: query.toString()});

      // let query = db('ward_members').select(['id', 'coupleName', 'address']).whereIn('id', assignedFamilies);
      let query = db.raw(`select id, coupleName, replace(address, ' undefined', '') address from ward_members where id in (${assignedFamilies.join(",")})`);
      
      console.log("query.toString()", query.toString());
      query//.orderBy('coupleName', 'asc')
      .asCallback((err, assignedFamilies) => {
        console.log({ministeringBrothers, assignedFamilies});
      });
      
    });
  });
}
*/

// renderAssignments();
/*
select id, district_id, companionship_id, name from district_assignments where type = 'minister' and legacyCmisId = 3559109763 and createdAt in (select max(createdAt) from district_assignments)

select id, type, name from district_assignments where district_id || '-' || companionship_id in (select district_id || '-' || companionship_id dcid from district_assignments where type = 'minister' and legacyCmisId = 3559109763 and createdAt in (select max(createdAt) from district_assignments)) and createdAt in (select max(createdAt) from district_assignments)

comp 1 has assignments?
comp 2 has assignments?

combine together. >1?

add families until >1

if
  does family minister to comp 1?
  does family minister to comp 2?

else 
  add family

*/

const assigned = []
let cache = {}

const alloy = [
    3490995727, 
    3559109763, 
    643707720, 
    672161638, 
    19681208225, 
    6392601365, 
    21122612581, 
    2024598596, 
    1419983803, 
    3699599140, 
    1598979256, 
    1979369783, 
    7855441019, 
    2586925712, 
    5636786427, 
    1460140336, 
    1598983188, 
    1369421232, 
    1922486522, 
    1160367605, 
  ]

const cottonwoods = [
  34366232446, 
  1042936459, 
  3560941092, 
  2340594759, 
  999039611, 
  2352006406, 
  2143329268, 
  3360534916, 
  24701515049, 
  5763227751, 
  2279031435, 
  1208811811, 
  5712568846, 
  2013838678, 
  5701426541, 
  1038268192, 
  7847903375, 
  5656381549, 
  1920508726, 
  3365648482, 
  2537419866, 
  2193685409, 
  642564491, 
  2891153399, 
  3377159412, 
  2675804640, 
  3224000148, 
  20800068655, 
  3695204147, 
  2222157021, 
  3349139980, 
  3038082409, 
  1920191217, 
  2013510356, 
]

const meadows = [
  5791645298,
  5235180794,
  945992016,
  6088831756,
  2045101027,
  3710124121,
  5629239936,
  5703271632,
  2343826863,
  5766759670,
  3858901171,
  20801949134,
  3042615022,
  8339579332,
  3694966261,
  3562771438,
  1532048752,
  5552310356,
  947199140,
  3776791181,
  6405311555,
  1493201575,
]

const notHeadsOfHouse = {
  16412716514:	"Claybaugh, Carter", 
  16412717497:	"Claybaugh, Ryder", 
  1192663087:	"Cusick, Sadie", 
  1040645086:	"Fieldsted, Lo Ann", 
  9172885143:	"Macy, Raef", 
  16354111037:	"Bristol, Curtis", 
  8274515545:	"Bristol, Matthew", 
  20203047537:	"Vezzani, Matthew", 
  6123442203:	"Gualotuna, Edwin", 
  945992999:	"Moline, Carrie", 
  1432209374:	"Taylor, Thalia", 
}


const step2 = (group, assignments, cache) => {
  const assignedFamilies = _.flatten(assignments)
  const associations = {}
  // console.log(">>>assignments", assignments)
  // console.log(">>>cache", cache)
  const newAssignments = []
  for (let idx=0; idx < assignments.length; idx+=2) {
    const comp1 = group[idx]
    const comp2 = group[idx+1]
    const families = _.flatten(assignments[idx].concat(assignments[idx+1]))
    assignedFamilies.push(...families)

    const excludes = []
    while (families.length < 2) {
      const family = _.difference(group, [...assignedFamilies, comp1, comp2, ...excludes]).shift()
      if (!associations[family] || (!associations[family].includes(comp1) && !associations[family].includes(comp2))) {
        families.push(family)
        assignedFamilies.push(family)
      } else {
        excludes.push(family)
      }
    }
    associations[comp1] = families
    associations[comp2] = families
    newAssignments.push({comps: [cache[comp1], cache[comp2]], families: families.map(f => cache[f])})
    // newAssignments.push({comps: [comp1, comp2], families})
  }
  console.log(">>>newAssignments", JSON.stringify(newAssignments))
  console.log(">>>assignedFamilies", assignedFamilies)
}

// const group = alloy
// const group = cottonwoods
// const group = meadows
const group = meadows
let query = db.raw(`select wm.id, coupleName, replace(address, ' undefined', '') address, t.name district from ward_members wm inner join tag_associations ta inner join tags t on wm.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in ('meadows', 'cottonwoods', 'alloy', 'other-neighborhoods')`)
query//.orderBy('coupleName', 'asc')
.asCallback((err, rows2) => {
  if (err) return console.log({msg: 'Unable to fetch records', raw: err, query: query.toString()});
  cache = rows2.reduce((map, row) => {
    map[row.id] = row
    return map
  }, {});

  group.forEach(mid => {
      let query = db.raw(`select id, legacyCmisId, name from district_assignments where district_id || '-' || companionship_id in (select district_id || '-' || companionship_id dcid from district_assignments where type = 'minister' and legacyCmisId = ${mid} and createdAt in (select max(createdAt) from district_assignments)) and type = 'assignment' and createdAt in (select max(createdAt) from district_assignments)`);
      // console.log("query.toString()", query.toString());

      query//.orderBy('coupleName', 'asc')
      .asCallback((err, rows) => {
        if (err) return console.log({msg: 'Unable to fetch records', raw: err, query: query.toString()});
        // console.log(">>>rows", rows)
        // assigned.push(rows.map(r => r.legacyCmisId));
        assigned.push(rows.map(r => r.legacyCmisId));

        if (assigned.length == group.length) {
          // console.log(">>>assigned", assigned)
          step2(group, assigned, cache)
        }
      })
  })

});
  
