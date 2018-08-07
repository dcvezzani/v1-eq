// var async = require('async');
// import db from './../../db'
import Member from './../models/members-02'

export const fetchMemberSyncReport = (data, callback) => {
  if (data.err) return callback(data.err);
  
  Member.all((err, rows) => {
    if (err) return callback(err);

    const dbIds = rows.map(row => row.id);
    const ldsIds = JSON.parse(data.stdout)[0].members.map(member => member.id);

    const removedIds = dbIds.filter(item => !ldsIds.includes(item)) || [];
    const newIds = ldsIds.filter(item => !dbIds.includes(item)) || [];

    callback(err, {responsePayload: { ...data, removedIds, newIds }});
  });
};

export const importMembers = (data, callback) => {
  callback(null, data);
};
