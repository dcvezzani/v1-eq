import db from './db'
import _ from 'lodash'
import async from 'async'
import fs from 'fs'

/*
node_modules/.bin/babel-node minist-assigns-02.js

select wm.id, coupleName, replace(address, ' undefined', '') address, t.name district from ward_members wm inner join tag_associations ta inner join tags t on wm.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in ('meadows', 'cottonwoods', 'alloy', 'other-neighborhoods')

let query = db.raw(`
`)
query//.orderBy('coupleName', 'asc')
.asCallback((err, rows) => {
  if (err) return console.log({msg: 'Unable to fetch records', raw: err, query: query.toString()});
  console.log({err, rows});
});

select m.id, m.name, t.name from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in ('meadows', 'cottonwoods', 'alloy', 'other-neighborhoods')
*/

const districtNames = ['hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'];
const districtNamesList = districtNames.map(d => `'${d}'` ).join(', ');

const queries = {
  xfamilies: db.raw(`select m.id, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList})`), 
  families: db.raw(` select id, age, name, address, phone, email, area, 1 alreadyAssigned from (
  select m.id, e.age age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
  join tag_associations ta on m.id = ta.association_id
  join tags t on t.id = ta.tag_id
  join members e on m.id = e.id
  where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
  --- > 122
  UNION ALL
  select m.id, -1 age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
  join tag_associations ta on m.id = ta.association_id
  join tags t on t.id = ta.tag_id
  where m.id not in (
    select m.id from ward_members m
    join tag_associations ta on m.id = ta.association_id
    join tags t on t.id = ta.tag_id
    join members e on m.id = e.id
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'))
  and m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
  )
where id in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment')
--- >65
UNION ALL
select id, age, name, address, phone, email, area, 0 alreadyAssigned from (
  select m.id, e.age age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
  join tag_associations ta on m.id = ta.association_id
  join tags t on t.id = ta.tag_id
  join members e on m.id = e.id
  where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
  --- > 122
  UNION ALL
  select m.id, -1 age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
  join tag_associations ta on m.id = ta.association_id
  join tags t on t.id = ta.tag_id
  where m.id not in (
    select m.id from ward_members m
    join tag_associations ta on m.id = ta.association_id
    join tags t on t.id = ta.tag_id
    join members e on m.id = e.id
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'))
  and m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
  )
where id not in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment')
--- >77 
`), 
  xfamilies: db.raw(` select m.id, e.age age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
join tag_associations ta on m.id = ta.association_id
join tags t on t.id = ta.tag_id
join members e on m.id = e.id
where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
--- > 122
UNION ALL
select m.id, -1 age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
join tag_associations ta on m.id = ta.association_id
join tags t on t.id = ta.tag_id
where m.id not in (
  select m.id from ward_members m
  join tag_associations ta on m.id = ta.association_id
  join tags t on t.id = ta.tag_id
  join members e on m.id = e.id
  where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'))
and m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
`), 
  xelders: db.raw(`select m.id, m.name name, m.age, replace(m.address, '<br />', ' ') address, m.phone, m.email, t.name area from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList})`), 
  elders: db.raw(` select m.id, m.name name, m.age, replace(m.address, '<br />', ' ') address, m.phone, m.email, t.name area, 1 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister')
UNION ALL
    select m.id, m.name name, m.age, replace(m.address, '<br />', ' ') address, m.phone, m.email, t.name area, 0 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id not in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister')
    `), 
//   elders: db.raw(` select m.id, m.name name, m.age, replace(m.address, '<br />', ' ') address, m.phone, m.email, t.name area, 0 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList})
// UNION ALL
//     select m.id, m.name name, m.age, replace(m.address, '<br />', ' ') address, m.phone, m.email, t.name area, 1 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister')
//     `), 
  // elderIdsAlreadyAssigned: db.raw(`select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister'`), 
  // familyIdsAlreadyAssigned: db.raw(`select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment'`), 
  xministersWith: (id) => { return db.raw(`select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId = ${id} and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id`)}, 
  ministersWith: (id) => { return db.raw(`
    select m.id, e.age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
    join tag_associations ta on m.id = ta.association_id
    join tags t on ta.tag_id = t.id 
    join members e on m.id = e.id
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') and m.id in (select id from (select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId = ${id} and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id))`)}, 
  xfamiliesFor: (id) => { return db.raw(`select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, name, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId in (${id}) and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id
    `)},
  familiesFor: (id) => { return db.raw(`
    select m.id, e.age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m 
    join tag_associations ta on m.id = ta.association_id
    join tags t on ta.tag_id = t.id 
    join members e on m.id = e.id
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') and m.id in (select id from (select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, name, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId in (${id}) and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id))
    UNION ALL
    select m.id, -1 age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m 
    join tag_associations ta on m.id = ta.association_id
    join tags t on ta.tag_id = t.id 
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') and m.id in (select id from (select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, name, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId in (${id}) and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id)) and m.id not in (
    select m.id from ward_members m 
    join tag_associations ta on m.id = ta.association_id
    join tags t on ta.tag_id = t.id 
    join members e on m.id = e.id
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') and m.id in (select id from (select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, name, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId in (${id}) and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id))
    )
    
    `)},
}

/*

(select id from (select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, name, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId in (945680405) and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id))

select m.id, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') and m.id in (select id from (select q2.legacyCmisId id, q2.name name, q2.type type from (select district_id, companionship_id, legacyCmisId, name, type from district_assignments where createdAt in (select max(createdAt) from district_assignments) and legacyCmisId in (${id}) and type = 'minister') q1 inner join (select district_id, companionship_id, legacyCmisId, type, name from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment') q2 on q1.district_id = q2.district_id and q1.companionship_id = q2.companionship_id))



select m.id, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
join tag_associations ta on m.id = ta.association_id
join tags t on t.id = ta.tag_id
where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')


select m.id, e.age age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
join tag_associations ta on m.id = ta.association_id
join tags t on t.id = ta.tag_id
join members e on m.id = e.id
where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
--- > 122
UNION ALL
select m.id, -1 age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
join tag_associations ta on m.id = ta.association_id
join tags t on t.id = ta.tag_id
where m.id not in (
  select m.id from ward_members m
  join tag_associations ta on m.id = ta.association_id
  join tags t on t.id = ta.tag_id
  join members e on m.id = e.id
  where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'))
and m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
--- > 20

m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id, members e 
where archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')


*/

// console.log(">>>queries", queries)

const lists = {
  elders: [], 
  ministers: [], 
  ward_members: [], 
  families: [], 
  assignments: {}, 
  // alreadyAssignedIds: {ministers: [], families: []},
}

const completeAssignments = (districtName, callback = null) => { console.log(`processing district: ${districtName}, ${lists.elders[districtName].length}`);
  const noAssignment = []
  const offset = 0

  console.log(`starting ${districtName}`, {ministers: lists.ministers[districtName].length, families: lists.families[districtName].length})

  lists.elders[districtName].forEach((elder, index) => {
    let state = null
    let ministers = null
    let families = null


    // setTimeout(() => { }, (index+1) * offset * 1000)

    async.series({
      isAvailable: (cb) => { // console.log("checking if elder is available");
        // console.log(">>>lists.ministers", {list: lists.ministers[districtName].map(m => m.id), elder: elder.id})
        // console.log(">>>lists.ministers", (!lists.ministers[districtName].map(m => m.id).includes(elder.id)));
        // console.log(">>>lists.ministers", lists.ministers[districtName].length);
        if (!lists.ministers[districtName].map(m => m.id).includes(elder.id)) return cb('na')
        cb()
      }, 
      getMinisters: (cb) => { // console.log("getting ministers");
        const query = queries.ministersWith(elder.id)
        query
        .asCallback((err, rows) => {
          if (err) return cb({msg: 'Unable to fetch records', raw: err, query: query.toString()});
          ministers = rows
          cb()
        });
      }, 
      getFamilies: (cb) => { // console.log("getting families");
        const query = queries.familiesFor(elder.id)
        query
        .asCallback((err, rows) => {
          if (err) return cb({msg: 'Unable to fetch records', raw: err, query: query.toString()});
          families = rows
          cb()
        });
      }, 
      completeAssignment: (cb) => { 
        // console.log("completing assignment");

        // if (ministers && ministers.length > 0) {
        //   console.log(">>>ministers[0]", {list: lists.ministers[districtName].length, m: ministers[0], chk: (lists.ministers[districtName].map(m => m.id).includes(ministers[0].id)), xxx: lists.ministers[districtName].map(m => m.name)})
        //   asdf.asdf
        // }

        if (ministers.length === 0) {
          // console.log("noassign", ministers, elder.name);
          noAssignment.push(elder);
          cb()
        } else if (lists.ministers[districtName].map(m => m.id).includes(ministers[0].id)) {
          lists.ministers[districtName] = lists.ministers[districtName].filter(m => !ministers.map(m => m.id).includes(m.id))
          lists.families[districtName] = lists.families[districtName].filter(m => !families.map(m => m.id).includes(m.id))

          if (!lists.assignments[districtName]) lists.assignments[districtName] = []
          lists.assignments[districtName].push({ministers, families})

          // finish assigning companionships
          const ministersStash = []
          while (lists.assignments[districtName][lists.assignments[districtName].length-1].ministers.length < 2 && lists.ministers[districtName].length > 0) {
            // if one of the ministers would be assigned to himself, skip
            if (families.map(m => m.id).includes(lists.ministers[districtName][0].id)) {
              ministersStash.push(lists.ministers[districtName].shift())
            }
            // if one of the ministers already has an assignment
            else if (lists.ministers[districtName][0].alreadyAssigned) {
              lists.ministers[districtName].shift()
            }
            else {
              const addedMinister = lists.ministers[districtName].shift()
              addedMinister.added = true
              lists.assignments[districtName][lists.assignments[districtName].length-1].ministers.push(addedMinister)
            }
          }
          ministersStash.reverse().forEach(m => lists.ministers[districtName].unshift(m))

          // todo; family assignment is going wrong
          // remove extra families (>2) from current assignments
          // and return to pool
          while (lists.assignments[districtName][lists.assignments[districtName].length-1].families.length > 2) {
            const extraFamily = lists.assignments[districtName][lists.assignments[districtName].length-1].families.pop()
            lists.families[districtName].push(extraFamily);
          }

          // todo; family assignment is going wrong
          // finish assigning families
          //
          // part of the problem is processing a district and not knowing there is an existing assignment in a district not yet processed
          // it will likely be necessary to have an array listing all currently assigned families and ministers
          const familiesStash = []
          while (lists.assignments[districtName][lists.assignments[districtName].length-1].families.length < 2 && lists.families[districtName].length > 0) {
            // if one of the ministers would be assigned to himself, skip
            if (ministers.map(m => m.id).includes(lists.families[districtName][0].id)) {
              familiesStash.push(lists.families[districtName].shift())
            }
            // if one of the families already has an assignment
            else if (lists.families[districtName][0].alreadyAssigned) {
              lists.families[districtName].shift()
            }
            else {
              const addedFamily = lists.families[districtName].shift()
              addedFamily.added = true
              lists.assignments[districtName][lists.assignments[districtName].length-1].families.push(addedFamily)
            }
          }
          familiesStash.reverse().forEach(m => lists.families[districtName].unshift(m))

          cb()
        }
      }, 
    }, 
    (err) => {
      if (err) switch(err) {
        case 'na': 
          break;
        default: return callback(err)
      }


      if (index === lists.elders[districtName].length - 1) {
      console.log("DONE (2)");

        // // todo; family assignment is going wrong
        // if (!lists.assignments[districtName]) lists.assignments[districtName] = []
        // while (lists.ministers[districtName].length > 1 && lists.families[districtName].length > 1) {
        //   const ministers = [lists.ministers[districtName].shift(), lists.ministers[districtName].shift()]
        //   const families = [lists.families[districtName].shift(), lists.families[districtName].shift()]
        //   lists.assignments[districtName].push({ministers, families})
        // }
        
        console.log(`====== results for ${districtName}`);
        console.log("noAssignment", noAssignment.length)
        // console.log(">>>lists.assignments", lists.assignments)
        console.log("assignments", (lists.assignments[districtName]) ? JSON.stringify(lists.assignments[districtName].map(o => o.families.length)) : "none")
        console.log("remaining", {ministers: lists.ministers[districtName].length, families: lists.families[districtName].length})

        if (callback) callback(null);
      }
    })
  })
};

async.series({
  gatherElders: (cb) => { console.log("gather elders"); 
    queries.elders//.orderBy('coupleName', 'asc')
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      console.log("ministering brothers", {err, rows: rows.length});
      rows.forEach(elder => {
        if (!lists.elders[elder.area]) lists.elders[elder.area] = []
        lists.elders[elder.area].push(elder)
      })

      const districtNames = Object.keys(lists.elders)
      districtNames.forEach(districtName => {
        lists.elders[districtName] = _.sortBy(lists.elders[districtName], ['age', 'name']);
        lists.ministers[districtName] = [...lists.elders[districtName]]
      })

      // console.log(">>>lists.elders", Object.keys(lists.elders), lists.elders.meadows)
      cb(); 
    });
  }, 
  // gatherEldersAlreadyAssigned: (cb) => { console.log("gather elders already assigned"); 
  //   queries.elderIdsAlreadyAssigned //.orderBy('coupleName', 'asc')
  //   .asCallback((err, rows) => {
  //     if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elderIdsAlreadyAssigned.toString()});
  //
  //     console.log("ministering brothers already assigned", {err, rows: rows.length});
  //
  //     lists.alreadyAssignedIds.ministers = rows.map(r => r.id)
  //     cb(); 
  //   });
  // }, 
  gatherFamilies: (cb) => { console.log("gather ward members"); 
    queries.families
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.families.toString()});

      console.log("families", {err, rows: rows.length});
      rows.forEach(family => {
        if (!lists.ward_members[family.area]) lists.ward_members[family.area] = []
        lists.ward_members[family.area].push(family)
      })

      const familyNames = Object.keys(lists.ward_members)
      familyNames.forEach(familyName => {
        lists.ward_members[familyName] = _.shuffle(lists.ward_members[familyName])
        lists.families[familyName] = [...lists.ward_members[familyName]]
      })

      // console.log(">>>lists.ward_members", Object.keys(lists.ward_members), lists.ward_members.meadows)
      cb(); 
    });
  }, 
  // gatherFamiliesAlreadyAssigned: (cb) => { console.log("gather families already assigned"); 
  //   queries.familyIdsAlreadyAssigned //.orderBy('coupleName', 'asc')
  //   .asCallback((err, rows) => {
  //     if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.familyIdsAlreadyAssigned.toString()});
  //
  //     console.log("families already assigned", {err, rows: rows.length});
  //
  //     lists.alreadyAssignedIds.families = rows.map(r => r.id)
  //     cb(); 
  //   });
  // }, 
  processDistricts: (cb) => { console.log("process district areas"); 
    /* let query = db.raw(` */
    /* `) */
    /* query//.orderBy('coupleName', 'asc') */
    /* .asCallback((err, rows) => { */
    /*   if (err) return console.log({msg: 'Unable to fetch records', raw: err, query: query.toString()}); */
    /*   console.log({err, rows}); */
    /* }); */
    
    const districtNames = Object.keys(lists.elders);
    districtNames.forEach((districtName, index) => {
      completeAssignments(districtName, (err) => {
        if (err) return console.log(err)
        if (index === districtNames.length - 1) {
          cb();
        }
      });
    });
    /* completeAssignments(districtNames[1], (err) => cb(err)); */
  }, 
}, 
  (err) => {
  if (err) return console.log(err);

  fs.writeFile(`district-assignments-eq.json`, JSON.stringify({
    ministers: {...lists.ministers}, 
    families: {...lists.families}, 
    assignments: {...lists.assignments}, 
  }), (err) => {
    if (err) return console.log(err)
    console.log("DONE");
  });

  // console.log("DONE", JSON.stringify({ministers: {...lists.ministers}}));
  // console.log("DONE");
})

/*

*/

