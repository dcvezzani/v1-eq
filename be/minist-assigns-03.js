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
    where m.archived_at is null and t.name in (${districtNamesList}) and m.id not in (
      select m.id from ward_members m
      join tag_associations ta on m.id = ta.association_id
      join tags t on t.id = ta.tag_id
      join members e on m.id = e.id
      where m.archived_at is null and t.name in (${districtNamesList})
    ) order by area
  )
  UNION ALL
  select id, age, name, address, phone, email, area from (
    select m.id, e.age age, m.coupleName name, replace(m.address, ' undefined', '') address, m.phone, m.email, t.name area from ward_members m
    join tag_associations ta on m.id = ta.association_id
    join tags t on t.id = ta.tag_id
    join members e on m.id = e.id
    where m.archived_at is null and t.name in (${districtNamesList}) order by area, age
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
    select m.id, m.age age, t.name area, 0 alreadyAssigned from members m inner join tag_associations ta inner join tags t on m.id = ta.association_id and ta.tag_id = t.id where archived_at is null and t.name in ('hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods') and m.id not in ( select legacyCmisId from district_assignments where createdAt in (select max(createdAt) from district_assignments) and type = 'minister') and m.id not in (
      select m.id from members m
      join tag_associations ta on ta.association_id = m.id
      join tags t on ta.tag_id = t.id
      where t.name in ('unavailable-ministers')
    ) order by area, age
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
    where createdAt in (select max(createdAt) from district_assignments) and t.name in (${districtNamesList}) 
    UNION ALL
    select '' area, assign_id, type, legacyCmisId from (
      select district_id || '-' || companionship_id assign_id, da.name, type, legacyCmisId from district_assignments da
      where createdAt in (select max(createdAt) from district_assignments)
      EXCEPT
      select district_id || '-' || companionship_id assign_id, da.name, type, legacyCmisId from district_assignments da
      join tag_associations ta on da.legacyCmisId = ta.association_id
      join tags t on t.id = ta.tag_id
      where createdAt in (select max(createdAt) from district_assignments) and t.name in (${districtNamesList})
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
    where createdAt in (select max(createdAt) from district_assignments) and t.name in (${districtNamesList})
  )
  `), 

  xcurrentAssignments: db.raw(` 
  select t.name area, district_id || '-' || companionship_id assign_id, type, legacyCmisId from district_assignments da
  join tag_associations ta on da.legacyCmisId = ta.association_id
  join tags t on t.id = ta.tag_id
  where createdAt in (select max(createdAt) from district_assignments) and t.name in (${districtNamesList}) order by t.name, district_id, companionship_id, type desc
  `), 
}

let assignments = {areas: {}, assign_id: {}}
const availableEldersByArea = {}
const availableFamiliesByArea = {}
const available = {}
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

      rows.forEach(row => {
        if (!availableEldersByArea[row.area]) availableEldersByArea[row.area] = []
        availableEldersByArea[row.area].push(row.id)
      })
      const details = Object.keys(availableEldersByArea).map(area => ({name: area, count: availableEldersByArea[area].length}) )
      console.log("available ministering brothers", {err, rows: rows.length, details});
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

      rows.forEach(row => {
        if (!availableFamiliesByArea[row.area]) availableFamiliesByArea[row.area] = []
        availableFamiliesByArea[row.area].push(row.id)
      })
      const details = Object.keys(availableFamiliesByArea).map(area => ({name: area, count: availableFamiliesByArea[area].length}) )
      console.log("available families", {err, rows: rows.length, details});
      cb(); 
    });
  }, 
  
  currentAssignments: (cb) => { console.log("gather current assignments"); 
    queries.currentAssignments
    .asCallback((err, rows) => {
      if (err) return cb({msg: 'Unable to fetch records', raw: err, query: queries.elders.toString()});

      rows.forEach(row => {
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
            assignments.assign_id[row.assign_id].families.push({...personDetails(row.id), assign_id: row.assign_id})
          }
          else {
            if (!available[row.area]) available[row.area] = {ministers: [], families: []}
            available[row.area].families.push({...personDetails(row.id), assign_id: row.assign_id})
          }
        }
      });

      console.log("current assignments", {err, rows: rows.length, assignments: Object.keys(assignments.assign_id).length});
      console.log("available", {available});
      cb(); 
    });
  }, 
  
  completeCurrentAssignments: (cb) => { console.log("complete current assignments"); 
    const newAssignments = {areas: {}}

    if (assignments.areas['']) {
      if (!availableEldersByArea['']) availableEldersByArea[''] = []
      if (!availableFamiliesByArea['']) availableFamiliesByArea[''] = []

      const assignIds = Object.keys(assignments.areas[''])
      assignIds.forEach(assignId => {
        const assign = assignments.areas[''][assignId]
        availableEldersByArea[''] = availableEldersByArea[''].concat(assign.ministers.map(m => m.id))
        availableFamiliesByArea[''] = availableFamiliesByArea[''].concat(assign.families.map(f => f.id))
      })
    }
    delete assignments.areas['']

    const areaNames = Object.keys(assignments.areas)
    areaNames.forEach(areaName => {
      const area = assignments.areas[areaName];
      const assignIds = Object.keys(area);
      newAssignments.areas[areaName] = {}

      assignIds.forEach(assignId => {
        const assignment = assignments.areas[areaName][assignId];
        newAssignments.areas[areaName][assignId] = {ministers: [...assignment.ministers], families: [...assignment.families]}

        while (newAssignments.areas[areaName][assignId].ministers.length < 2 && availableEldersByArea[areaName].length > 0) {
          const companionId = availableEldersByArea[areaName].shift()
          newAssignments.areas[areaName][assignId].ministers.push({...personDetails(companionId), assign_id: assignId, added: true})
        }

        const ministerIds = newAssignments.areas[areaName][assignId].ministers.map(m => m.id)
        let infLoopCnt = 0
        let lastQueueLength = availableFamiliesByArea[areaName].length

        while (newAssignments.areas[areaName][assignId].families.length < 2 && availableFamiliesByArea[areaName].length > 0 && infLoopCnt < 5) {
          const familyId = availableFamiliesByArea[areaName].shift()

          if (!ministerIds.includes(familyId)) {
            newAssignments.areas[areaName][assignId].families.push({...personDetails(familyId), assign_id: assignId, added: true})
          } else {
            availableFamiliesByArea[areaName].push(familyId)
          }

          if (lastQueueLength === availableFamiliesByArea[areaName].length) infLoopCnt += 1
          else infLoopCnt = 0

          lastQueueLength = availableFamiliesByArea[areaName].length
          
        }
      })
    })

    assignments = newAssignments
    cb()
  }, 
  
  createNewAssignments: (cb) => { console.log("create new assignments"); 
    const newAssignments = {areas: {}}
    const areaNames = Object.keys(availableEldersByArea)

    areaNames.forEach(areaName => {

      newAssignments.areas[areaName] = {}

      if (!assignments.areas[areaName]) {
        assignments.areas[areaName] = {}
      }
      else {
        const area = assignments.areas[areaName];
        const assignIds = Object.keys(area);
        assignIds.forEach(assignId => {
          const assignment = assignments.areas[areaName][assignId];
          newAssignments.areas[areaName][assignId] = {ministers: [...assignment.ministers], families: [...assignment.families]}
        })
      }

      let index = 1
      while (availableEldersByArea[areaName].length > 0) {
        const assignId = `4-${index}`
        newAssignments.areas[areaName][assignId] = {ministers: [], families: []}

        const comp1Id = availableEldersByArea[areaName].shift()
        const ministers = [{...personDetails(comp1Id), assign_id: assignId, added: true}]

        if (availableEldersByArea[areaName].length > 0) {
          const comp2Id = availableEldersByArea[areaName].shift()
          ministers.push({...personDetails(comp2Id), assign_id: assignId, added: true})
        }
        newAssignments.areas[areaName][assignId].ministers = ministers

        const ministerIds = newAssignments.areas[areaName][assignId].ministers.map(m => m.id)
        let infLoopCnt = 0
        let lastQueueLength = availableFamiliesByArea[areaName].length
        
        while (newAssignments.areas[areaName][assignId].families.length < 2 && availableFamiliesByArea[areaName].length > 0 && infLoopCnt < 5) {
          const familyId = availableFamiliesByArea[areaName].shift()

          if (!ministerIds.includes(familyId)) {
            newAssignments.areas[areaName][assignId].families.push({...personDetails(familyId), assign_id: assignId, added: true})
          } else {
            availableFamiliesByArea[areaName].push(familyId)
          }

          if (lastQueueLength === availableFamiliesByArea[areaName].length) infLoopCnt += 1
          else infLoopCnt = 0

          lastQueueLength = availableFamiliesByArea[areaName].length
        }

        index += 1
      }
    })

    assignments = newAssignments
    cb()
  }, 
  
  distributeRemainingFamilies: (cb) => { console.log("distribute remaining families");
    const areaNames = Object.keys(assignments.areas)
    areaNames.forEach(areaName => {
      const area = assignments.areas[areaName];
      const assignIds = Object.keys(area);

      assignIds.forEach(assignId => {
        if (availableFamiliesByArea[areaName].length > 0) {
          const assignment = assignments.areas[areaName][assignId];
          const ministerIds = assignment.ministers.map(m => m.id)
          const availableFamilyIds = availableFamiliesByArea[areaName].filter(id => !ministerIds.includes(id))

          if (availableFamilyIds.length > 0) {
            const availableFamilyId = availableFamilyIds[0]
            availableFamiliesByArea[areaName] = availableFamiliesByArea[areaName].filter(id => id !== availableFamilyId)
            assignments.areas[areaName][assignId].families.push({...personDetails(availableFamilyId), assign_id: assignId, added: true})
          }
        }
      })
    })
    cb()
  }, 
  
  checkAssignmentDetails: (cb) => { console.log("check assignment details"); 
    const ministerDetails = Object.keys(availableEldersByArea).map(area => ({name: area, count: availableEldersByArea[area].length}) )
    const familyDetails = Object.keys(availableFamiliesByArea).map(area => ({name: area, count: availableFamiliesByArea[area].length}) )
    console.log(">>>details", {ministerDetails, familyDetails})
    cb()
  }, 
  
  remainingElders: (cb) => { console.log("remaining elders"); 
    const areaNames = Object.keys(availableEldersByArea)
    assignments.ministers = areaNames.reduce((obj, areaName) => {
      const ministerIds = availableEldersByArea[areaName]
      obj[areaName] = ministerIds.map(ministerId => personDetails(ministerId))
      return obj
    }, {})
    cb()
  }, 
  
  remainingFamilies: (cb) => { console.log("remaining families"); 
    const areaNames = Object.keys(availableFamiliesByArea)
    assignments.families = areaNames.reduce((obj, areaName) => {
      const familyIds = availableFamiliesByArea[areaName]
      obj[areaName] = familyIds.map(familyId => personDetails(familyId))
      return obj
    }, {})
    cb()
  }, 
}, 
  (err) => {
  if (err) return console.log(err);

  fs.writeFile(`district-assignments-eq.json`, JSON.stringify({
    ministers: {...assignments.ministers}, 
    families: {...assignments.families}, 
    assignments: Object.keys(assignments.areas).reduce((coll, area) => {
      const areaAssignments = {}
      coll[area] = Object.values(assignments.areas[area])
      return coll
    }, {}), 
  }), (err) => {
    if (err) return console.log(err)
    console.log("DONE");
  });
})
