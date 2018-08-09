var moment = require('moment');
import db from './../../db'
import Member from './../models/members-02'

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

export const importMembers = (data, callback) => {
  db.batchInsert('members', data.members, 10)
    .asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to import records', raw: err, query: 'batch insert'});
      callback(null, { payload: rows });
    });
};

export const archiveMembers = (data, callback) => {
  console.log(">>> data", data);
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
