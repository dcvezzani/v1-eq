import moment from 'moment';
import fs from 'fs';
import db from './../../db';
import Member from './../models/members-02';

export const fetchFamilyDetails = (data, callback) => {
  if (data.err) return callback(data.err);
  callback(null, {responsePayload: { ok: true }});
};

export const fetchMemberSyncReport = (data, callback) => {
  if (data.err) return callback(data.err);
  
  Member.allNotArchived((err, rows) => {
    if (err) return callback(err);

    const dbIds = rows.map(row => row.id);
    const ldsData = JSON.parse(data.stdout);
    const ldsIds = ldsData[0].members.map(member => member.id);

    const removedIds = dbIds.filter(item => !ldsIds.includes(item)) || [];
    const newRecords = ldsData[0].members.filter(item => !dbIds.includes(item.id)) || [];

    callback(err, {responsePayload: { ...data, removedIds, newRecords }});
  });
};

const objectAttrs = (obj, attrs) => {

};

const familyMemberAttrs = (member) => {
  const {individualId, preferredName, directoryName, gender, surname} = member;
  return {individualId, preferredName, directoryName, gender, surname};
};

const processFamilies = (data, callback) => {
  data.families.forEach(f => {
    const { coupleName, householdName, headOfHouseIndividualId } = f;
    const payload = { coupleName, householdName, headOfHouseIndividualId };
    db('families')
    .insert(payload)
    .asCallback((err, rows) => {
      if (err) return callback({msg: 'Unable to import records', raw: err, query: 'record insert', payload: JSON.stringify(payload)});
      const familyId = rows[0];

      const { headOfHouse, spouse, children } = f;
      let memberData = [];
      memberData.push({familyId, type: 'headOfHouse', ...familyMemberAttrs(headOfHouse)})
      if (spouse.preferredName.length > 0) memberData.push({familyId, type: 'spouse', ...familyMemberAttrs(spouse)})
      children.forEach(child => {
        memberData.push({familyId, type: 'child', ...familyMemberAttrs(child)})
      });

      db.batchInsert('family_members', memberData, 10)
      .asCallback((err, rows) => {
        if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert', payload: JSON.stringify([headOfHouse, spouse, ...children])});
        callback(null, { payload: {familyId, rows} });
      });
    });
  });
};

export const importFamilies = (data, callback) => {
  const familyFile = `/Users/davidvezzani/Downloads/my-ward.json`
  fs.readFile(familyFile, (err, data) => {
    if (err) {
      return callback(Error(`Unable to read cached data from file`), {familyFile, err});
    }

    const families = JSON.parse(data);
    // return callback(Error(`wip`), families);
    processFamilies({families}, callback);
  });
};

export const importMembers = (data, callback) => {
  const memberIds = data.members.map(m => m.id);

  const queryArchived = db('members')
    .whereIn('id', memberIds)
    .whereNotNull('archived_at')

    queryArchived.asCallback((err, rows) => {
      if (err) return callback({msg: 'Unable to import records', raw: err, query: queryArchived.toString()});
      const memberIdsToUnarchive = rows.map(m => m.id);

      if (memberIdsToUnarchive.length > 0) {
        const queryUpdate = db('members')
          .whereIn('id', memberIdsToUnarchive)
          .update({ archived_at: null, })

          queryUpdate.asCallback((err, rows) => {
            if (err) return callback({msg: 'Unable to import records', raw: err, query: queryUpdate.toString()});
            const membersForBatchUpdate = data.members.filter(m => !memberIdsToUnarchive.includes(m.id));

            db.batchInsert('members', membersForBatchUpdate, 10)
              .asCallback((err, rows) => {
                if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert', payload: membersForBatchUpdate});
                callback(null, { payload: rows });
              });
            
          });
      } else {
        db.batchInsert('members', data.members, 10)
          .asCallback((err, rows) => {
            if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert', payload: data.members});
            callback(null, { payload: rows });
          });
      }
    });
};

export const archiveMembers = (data, callback) => {
  const query = db('members')
  .whereIn('id', data.memberIds)
  .update({
    archived_at: moment().toISOString(),
  })

  query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to archive records', raw: err, query: query.toString()});
      callback(null, { payload: rows });
    });

};
