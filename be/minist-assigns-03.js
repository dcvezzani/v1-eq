/*
/Users/davidvezzani/projects/v1-eq/be/minist-assigns-03.js
*/

import db from './db'
import _ from 'lodash'
import async from 'async'
import fs from 'fs'

const districtNames = ['hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'];
const districtNamesList = districtNames.map(d => `'${d}'` ).join(', ');

/*
(${districtNamesList})
('dry-creek')
('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
*/

const queries = {
  directory: db.raw(` 
  select id, '' age, name, address, phone, email, area from (
    select m.id, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
    join tag_associations ta on m.id = ta.association_id
    join tags t on t.id = ta.tag_id
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') and m.id not in (
      select m.id from ward_members m
      join tag_associations ta on m.id = ta.association_id
      join tags t on t.id = ta.tag_id
      join members e on m.id = e.id
      where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
    ) order by area
  )
  UNION ALL
  select id, age, name, address, phone, email, area from (
    select m.id, e.age age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
    join tag_associations ta on m.id = ta.association_id
    join tags t on t.id = ta.tag_id
    join members e on m.id = e.id
    where m.archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') order by area, age
  )
  `), 

  elders: db.raw(` 
  select m.id, m.age age, t.name area, 1 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister')
UNION ALL
    select m.id, m.age age, t.name area, 0 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id not in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister') order by age
  `), 

  assignedEldersByArea: db.raw(` 
  select m.id, m.age age, t.name area, 1 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister') order by age
  `), 
  availableEldersByArea: db.raw(` 
    select m.id, m.age age, t.name area, 0 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id not in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister') order by age
  `), 

  assignedFamiliesByArea: db.raw(` 
    select m.id, t.name area, 1 alreadyAssigned from ward_members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment')
  `), 
  availableFamiliesByArea: db.raw(` 
    select m.id, t.name area, 0 alreadyAssigned from ward_members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in (${districtNamesList}) and m.id not in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'assignment')
  `), 

  currentAssignments: db.raw(` 
  select assign_id, area, type, legacyCmisId id from (
    select t.name area, district_id || '-' || companionship_id assign_id, type, legacyCmisId from district_assignments da
    join tag_associations ta on da.legacyCmisId = ta.association_id
    join tags t on t.id = ta.tag_id
    where createdAt in (select max(createdAt) from district_assignments) and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') 
    UNION ALL
    select '' area, assign_id, type, legacyCmisId from (
      select district_id || '-' || companionship_id assign_id, da.name, type, legacyCmisId from district_assignments da
      where createdAt in (select max(createdAt) from district_assignments)
      EXCEPT
      select district_id || '-' || companionship_id assign_id, da.name, type, legacyCmisId from district_assignments da
      join tag_associations ta on da.legacyCmisId = ta.association_id
      join tags t on t.id = ta.tag_id
      where createdAt in (select max(createdAt) from district_assignments) and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
    ) 
  ) order by assign_id, type desc, area desc
  `), 

  nonMPCurrentCompanions: db.raw(` 
  select legacyCmisId id, '' age, name, '' address, '' phone, '' email, '' area from (
    select district_id || '-' || companionship_id assign_id, da.name, type, legacyCmisId from district_assignments da
    where createdAt in (select max(createdAt) from district_assignments)
    EXCEPT
    select district_id || '-' || companionship_id assign_id, da.name, type, legacyCmisId from district_assignments da
    join tag_associations ta on da.legacyCmisId = ta.association_id
    join tags t on t.id = ta.tag_id
    where createdAt in (select max(createdAt) from district_assignments) and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods')
  )
  `), 

  xcurrentAssignments: db.raw(` 
  select t.name area, district_id || '-' || companionship_id assign_id, type, legacyCmisId from district_assignments da
  join tag_associations ta on da.legacyCmisId = ta.association_id
  join tags t on t.id = ta.tag_id
  where createdAt in (select max(createdAt) from district_assignments) and t.name in (${districtNamesList}) order by t.name, district_id, companionship_id, type desc
  `), 
}

const assignments = {areas: {}, assign_id: {}}
const directory = {}

const personDetails = (id) => {
  return directory[id];
};

async.series({
  directory: (cb) => { console.log("load directory"); 
    queries.directory
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});
      console.log("directory", {err, rows: rows.length});

      rows.forEach(person => {
        directory[person.id] = person
      })
      cb(); 
    });
  }, 
  nonMPCurrentCompanions: (cb) => { console.log("load nonMPCurrentCompanions"); 
    queries.nonMPCurrentCompanions
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});
      console.log("nonMPCurrentCompanions", {err, rows: rows.length});

      rows.forEach(person => {
        directory[person.id] = person
      })
      cb(); 
    });
  }, 

  elders: (cb) => { console.log("gather elders"); 
    queries.elders
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      console.log("ministering brothers", {err, rows: rows.length});
      cb(); 
    });
  }, 

  assignedEldersByArea: (cb) => { console.log("gather assigned elders"); 
    queries.assignedEldersByArea
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      console.log("assigned ministering brothers", {err, rows: rows.length});
      cb(); 
    });
  }, 
  availableEldersByArea: (cb) => { console.log("gather available elders"); 
    queries.availableEldersByArea
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      console.log("available ministering brothers", {err, rows: rows.length});
      cb(); 
    });
  }, 

  assignedFamiliesByArea: (cb) => { console.log("gather assigned families"); 
    queries.assignedFamiliesByArea
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      console.log("assigned families", {err, rows: rows.length});
      cb(); 
    });
  }, 
  availableFamiliesByArea: (cb) => { console.log("gather available families"); 
    queries.availableFamiliesByArea
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      console.log("available families", {err, rows: rows.length});
      cb(); 
    });
  }, 
  
  currentAssignments: (cb) => { console.log("gather current assignments"); 
    queries.currentAssignments
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      rows.forEach(row => {
        // if (!assignments.areas[row.area]) assignments.areas[row.area] = {ministers: [], families: []}
        if (!assignments.areas[row.area]) assignments.areas[row.area] = {}
        if (!assignments.assign_id[row.assign_id]) assignments.assign_id[row.assign_id] = {ministers: [], families: []}

        if (row.type === 'minister') {
          if (assignments.assign_id[row.assign_id].ministers.length > 0) {
            const companion = assignments.assign_id[row.assign_id].ministers[0]
            if (!assignments.areas[companion.area][row.assign_id]) assignments.areas[companion.area][row.assign_id] = {ministers: [], families: []}
            assignments.areas[companion.area][row.assign_id].ministers.push({...personDetails(row.id), assign_id: row.assign_id})
          }
          else {
            if (!assignments.areas[row.area][row.assign_id]) assignments.areas[row.area][row.assign_id] = {ministers: [], families: []}
            assignments.areas[row.area][row.assign_id].ministers.push({...personDetails(row.id), assign_id: row.assign_id})
          }
          assignments.assign_id[row.assign_id].ministers.push({...personDetails(row.id), assign_id: row.assign_id})
        }
        else if (row.type === 'assignment') { 
          if (assignments.assign_id[row.assign_id].ministers.length > 0) {
            const minister = assignments.assign_id[row.assign_id].ministers[0]
            if (!assignments.areas[minister.area][row.assign_id]) assignments.areas[minister.area][row.assign_id] = {ministers: [], families: []}
            assignments.areas[minister.area][row.assign_id].families.push({...personDetails(row.id), assign_id: row.assign_id})
          }
          else {
            if (!assignments.areas[row.area][row.assign_id]) assignments.areas[row.area][row.assign_id] = {ministers: [], families: []}
            assignments.areas[row.area][row.assign_id].families.push({...personDetails(row.id), assign_id: row.assign_id})
          }
          assignments.assign_id[row.assign_id].families.push({...personDetails(row.id), assign_id: row.assign_id})
        }
      });

      console.log("current assignments", {err, rows: rows.length, assignments: Object.keys(assignments.assign_id).length});
      // console.log("current assignments", {err, rows: rows.length, assign_id: assignments.assign_id['3-6']});
      cb(); 
    });
  }, 
}, 
  (err) => {
  if (err) return console.log(err);

  fs.writeFile(`district-assignments-eq.json`, JSON.stringify({
    ministers: {}, 
    families: {}, 
    assignments: Object.keys(assignments.areas).reduce((coll, area) => {
      const areaAssignments = {}
      coll[area] = Object.values(assignments.areas[area])
      return coll
    }, {}), 
  }), (err) => {
    if (err) return console.log(err)
    console.log("DONE");
  });

  // console.log("DONE", JSON.stringify({ministers: {...lists.ministers}}));
  // console.log("DONE");
})
