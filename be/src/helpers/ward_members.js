const async = require('async');
import moment from 'moment';
import WardMember from './../models/ward_members';
import db from './../../db';
import { createFamilyNotes, findFamilyNotes } from '../api/drive'

const fetchWardMemberSyncReport = (members, callback) => {
  WardMember.allNotArchived((err, rows) => {
    if (err) return callback({msg: `Unable to fetch ward members`, err});

    const dbIds = rows.map(row => row.id);
    const ldsIds = members.map(member => member.id);

    const removedIds = dbIds.filter(item => !ldsIds.includes(item)) || [];
    const newRecords = members.filter(item => !dbIds.includes(item.id)) || [];

    callback(err, {removedIds, newRecords});
  });
};

const mergeContactInfo = (dst, src) => {
  let dst2 = {};
  const dstInfo = (src) ? contactInformationFor(dst) : {};
  const srcInfo = (src) ? contactInformationFor(src) : {};

  dst2.email = (dstInfo.email && dstInfo.email.length > 0) ? dstInfo.email : srcInfo.email;
  dst2.phone = (dstInfo.phone && dstInfo.phone.length > 0) ? dstInfo.phone : srcInfo.phone;
  dst2.address = (dstInfo.address && dstInfo.address.length > 0) ? dstInfo.address : srcInfo.address;
  return dst2;
};

const contactInformationFor = (data) => {
  const { email, phone } = data;
  let attrs = { email, phone };
  if (data.address) {
    const { addr1, addr2, addr3 } = data.address;
    attrs.address = `${addr1} ${addr2} ${addr3}`;
  }
  return attrs;
};

export const updateContactInfo = (data, callback) => {
  if (data.err) return callback(data.err);
  const memberInfo = JSON.parse(data.stdout);
  // const contactInfo = contactInformationFor(memberInfo.headOfHousehold);
  let contactInfo = mergeContactInfo(memberInfo.headOfHousehold, memberInfo.spouse)
  contactInfo = mergeContactInfo(contactInfo, memberInfo.householdInfo)

  WardMember.updateMemberContactInfo(data.memberId, contactInfo, (err) => {
    callback(err, {responsePayload: { json: data.stdout, memberId: data.memberId }});
  });
};

export const getPhotoUrl = (data, callback) => {
  console.log(">>>getPhotoUrl, data", data)
  if (data.err) return callback(data.err);
  callback(null, {responsePayload: { json: data.stdout, memberId: data.memberId }});
};

export const fetchWardMembers = (data, callback) => {
  WardMember.allNotArchivedIds(data.memberIds, (err, rows) => callback(err, {responsePayload: rows}))
};

export const fetchWardFamilies = (data, callback) => {
  WardMember.allNotArchivedWithTags('family-visits-alpha-', (err, rows) => callback(err, {responsePayload: rows}))
};

export const fetchWardFamiliesNotVisited = (data, callback) => {
  // WardMember.allNotArchived((err, rows) => callback(err, {responsePayload: rows}))
  WardMember.allNotArchivedWithOutTag('visited', (err, rows) => callback(err, {responsePayload: rows}))
};

export const fetchWardFamiliesVisited = (data, callback) => {
  // WardMember.allNotArchived((err, rows) => callback(err, {responsePayload: rows}))
  WardMember.allNotArchivedWithTag('visited', (err, rows) => callback(err, {responsePayload: rows}))
};

export const fetchMemberListSummary = (data, callback) => {
  if (data.err) return callback(data.err);
  let members = []
  try {
    members = JSON.parse(data.stdout);

    members.forEach(member => {
      let memberId = (member.headOfHouseIndividualId > -1) ? member.headOfHouseIndividualId : null;
      if (memberId === null) memberId = (member.headOfHouse.individualId > -1) ? member.headOfHouse.individualId : null;
      if (memberId === null) memberId = (member.spouse.individualId > -1) ? member.spouse.individualId : null;

      member['id'] = memberId;
      delete member.copyrightText;
    });

    fetchWardMemberSyncReport(members, (err, data2) => {
      callback(err, {responsePayload: { ...data2, members, memberId: data2.memberId }});
    });

  } catch (err) {
    callback({err, msg: `Unable to parse json; lds cookie expired?`});
  }
};

export const transformMembers = (members) => { 
  console.log("members", typeof members);
  return members.map(member => {
    const { headOfHouseIndividualId: id, isProfilePrivate, unitNo, householdName, coupleName } = member;
    const { 
      preferredName: headOfHouse_preferredName, 
      directoryName: headOfHouse_directoryName, 
      gender: headOfHouse_gender, 
      surname: headOfHouse_surname, 
      individualId: headOfHouse_individualId, 
    } = member.headOfHouse;
    const { 
      preferredName: spouse_preferredName, 
      directoryName: spouse_directoryName, 
      gender: spouse_gender, 
      surname: spouse_surname, 
      individualId: spouse_individualId, 
    } = member.spouse;
    const numberOfChildren = member.children.length;

    const headOfHouse = { headOfHouse_preferredName, headOfHouse_directoryName, headOfHouse_gender, headOfHouse_surname, headOfHouse_individualId }
    const spouse = { spouse_preferredName, spouse_directoryName, spouse_gender, spouse_surname, spouse_individualId }

    return ({id, coupleName, isProfilePrivate, unitNo, householdName, ...headOfHouse, ...spouse, numberOfChildren});
  });
};

const importMember = (member, callback) => {
  console.log("importMember:begin", member);
  const session = {};

  async.series({
    findFamilyNotes: (cb) => {
      console.log('findFamilyNotes:begin'); 

      findFamilyNotes({name: member.coupleName}, (err, files) => {
        console.log("findFamilyNotes:end", err, files);
        if (files.length > 0) {
          console.log(`Found family notes for ${member.coupleName}`);
          session.notes = 'exist'
        }
        cb(err, files)
      });
    }, 
    createFamilyNotes: (cb) => {
      console.log('createFamilyNotes:begin'); 
      if (session.notes === 'exist') {
        console.log('createFamilyNotes:end', `Member notes already exist; not creating family note for ${member.coupleName}`); 
        session.memberDetails = member;
        return cb() 
      }

        session.memberDetails = member;
      createFamilyNotes({name: member.coupleName}, (err, res) => {
        console.log('createFamilyNotes:end', err, res); 
        if (err) cb(Error(`Unable to create family notes for ${member.coupleName}`), err)

        const notes_url = `https://docs.google.com/document/d/${res.data.id}`
        session.memberDetails = { ...member, notes_url }
        cb(null, files)
      });
    }, 
    recordInDb: (cb) => {
      console.log('recordInDb:begin'); 
      const query = db('ward_members').insert(session.memberDetails);

      query
        .asCallback((err, rows) => {
          console.log('recordInDb:end'); 
          if (err) return cb({msg: 'Unable to import record', raw: err, query, payload: session.memberDetails});
          cb(null, { payload: rows });
        });
    }, 
  }, (err, res) => {
    console.log(">>>importMember:end", err, res);
    callback(err, res);
  })
};

export const importMembers = (data, callback) => {
  //todo: restructure rows so they are compatible with database table

  // console.log("importMembers, data", data);
  const members = transformMembers(data.members);
  // return callback({msg: 'Temporarily disabled', raw: Error(), json: JSON.stringify(members)});

  const memberIds = members.map(m => m.id);

  const queryArchived = db('ward_members')
    .whereIn('id', memberIds)
    .whereNotNull('archived_at')

    queryArchived.asCallback((err, rows) => {
      if (err) return callback({msg: 'Unable to import records', raw: err, query: queryArchived.toString()});
      const memberIdsToUnarchive = rows.map(m => m.id);

      if (memberIdsToUnarchive.length > 0) {
        const queryUpdate = db('ward_members')
          .whereIn('id', memberIdsToUnarchive)
          .update({ archived_at: null, })

          queryUpdate.asCallback((err, rows) => {
            if (err) return callback({msg: 'Unable to import records', raw: err, query: queryUpdate.toString()});
            const membersForBatchUpdate = members.filter(m => !memberIdsToUnarchive.includes(m.id));
            let cntDown = membersForBatchUpdate.length;

            membersForBatchUpdate.forEach(member => {
              importMember(member, (err, res) => {
                if (err) return callback(err);
                cntDown -= 1;
                if (cntDown === 0) return callback(null, {payload: null});
              });
            });

            // db.batchInsert('ward_members', membersForBatchUpdate, 10)
            //   .asCallback((err, rows) => {
            //     if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert', payload: membersForBatchUpdate});
            //     callback(null, { payload: rows });
            //   });
          });
      } else {

        let cntDown = members.length;
        members.forEach(member => {
          importMember(member, (err, res) => {
            if (err) return callback(err);
            cntDown -= 1;
            if (cntDown === 0) return callback(null, {payload: null});
          });
        });
        
        // db.batchInsert('ward_members', members, 10)
        //   .asCallback((err, rows) => {
        //     if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert', payload: members});
        //     callback(null, { payload: rows });
        //   });
      }
    });
};

export const archiveMembers = (data, callback) => {
  const query = db('ward_members')
  .whereIn('id', data.memberIds)
  .update({
    archived_at: moment().toISOString(),
  })

  query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to archive records', raw: err, query: query.toString()});
      callback(null, { payload: rows });
    });

};

