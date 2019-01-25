import async from 'async';
import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import db from './db';

fs.readFile('districts.json', (err, content) => {
  if (err) return console.error("Unable to read file");

  const districts = JSON.parse(content);
  // console.log(">>>districts", districts);

  const res = districts.filter(district => ["District 1", "District 2", "District 3"].includes(district.districtName)).map(district => {
    console.log("district.districtName", district.districtName);
    
    return district.companionships.filter(comp => {
      const {ministers, assignments} = comp;

      return (ministers.length < 2 || assignments.length < 2)
    })
    .map(comp => {
      const {ministers, assignments} = comp;
      return {ministers, assignments};
    })
      ;
  });

  // console.log(">>>res", JSON.stringify(res));
});

const records = {districts: [], assignments: []};
const chunkSize = 10;

fs.readFile('districts.json', (err, content) => {
  if (err) return console.error("Unable to read file");

  const districts = JSON.parse(content);
  // console.log(">>>districts", districts);

  districts.filter(district => ["District 1", "District 2", "District 3"].includes(district.districtName)).forEach(district => {
    console.log("district.districtName", district.districtName);

    const {districtName, districtUuid, supervisorName, supervisorPersonUuid} = district;
    records["districts"].push({districtName, districtUuid, supervisorName, supervisorPersonUuid})
    
    const store = {districtId: -1};
    async.series({
      // createDistrict: (cb) => {
      //   db('districts').insert({name: districtName, leader_id: supervisorPersonUuid, leader_name: supervisorName}).returning('*')
      //   .asCallback((err, rows) => cb(err, rows));
      // },
      fetchDistrict: (cb) => {
        db('districts').select("*").where({name: districtName})
        .asCallback((err, rows) => {
          if (err) return cb(err, rows);
          store.districtId = rows[0].id
          cb(err, rows);
        });
      },
      createAssignments: (cb) => {
        district.companionships.forEach((comp, idx) => {
          const {ministers, assignments} = comp;

          records["assignments"].push(ministers.concat(assignments))
          const data = ministers.concat(assignments).map(row => ({...row, district_id: store.districtId, companionship_id: (idx+1)}))
          // console.log(">>>data", data)
          db.batchInsert('district_assignments', data, chunkSize)
          .asCallback((err, rows) => {
            if (err) return cb(err, rows)
            if (idx === (district.companionships.length - 1)) cb(err, rows)
          });
        })
      },
    }, 
    (err, res) => {
      console.log("DONE >>>records", err, JSON.stringify(records));
      // console.log("DONE creating district and associated assignments", err, res);
    });
  });

});

