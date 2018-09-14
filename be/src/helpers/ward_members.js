import moment from 'moment';
import WardMember from './../models/ward_members';
import db from './../../db';

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

export const fetchWardFamilies = (data, callback) => {
  WardMember.allNotArchivedWithTags('family-visits-alpha-', (err, rows) => callback(err, {responsePayload: rows}))
};

export const fetchWardFamiliesNotVisited = (data, callback) => {
  // WardMember.allNotArchived((err, rows) => callback(err, {responsePayload: rows}))
  WardMember.allNotArchivedWithOutTag('visited', (err, rows) => callback(err, {responsePayload: rows}))
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

    fetchWardMemberSyncReport(members, (err, data) => {
      callback(err, {responsePayload: { ...data, members, memberId: data.memberId }});
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

            db.batchInsert('ward_members', membersForBatchUpdate, 10)
              .asCallback((err, rows) => {
                if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert', payload: membersForBatchUpdate});
                callback(null, { payload: rows });
              });
            
          });
      } else {
        db.batchInsert('ward_members', members, 10)
          .asCallback((err, rows) => {
            if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert', payload: members});
            callback(null, { payload: rows });
          });
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

