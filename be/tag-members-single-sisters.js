import async from 'async';
import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import db from './db';
import TagAssociation from './src/models/tag_associations';
import Tag from './src/models/tags';

/*
node_modules/.bin/babel-node tag-members-single-sisters.js
 */

const createWithMembers = (tagName, ids, callback) => {
  Tag.createWithMembers(tagName, `Single sisters`, ids, (err, res) => {
    if (err) return callback(Error(`Unable to create list, ${tagName} (count: ${ids.length})`), {err});
    console.log(`List created: ${tagName} (count: ${ids.length})`)
  });
  //	createWithMembers: (name, description, memberIds, callback) => {

  Tag.fetch(tagName, (err, rows) => {
    // console.log(">>>rows", err, rows);
    if (err) return callback(err)
    const tagId = rows[0].id

    const association_type = 'ward_members';

    if (ids.length > 0) {
      TagAssociation.addMembers(association_type, tagName, ids, (err, rows) => {
        console.log("Tag '${tagName}' (${tagId}) was added for member ids: ${ids}", err, rows);
        callback(err, rows)
      });
    } else {
      console.log("No updates made; empty array of ward_member ids");
      callback()
    }
  });
};

async.series({
  cleanTagAssociations: (cb) => {
    db.schema.raw("delete from tag_associations where association_type = 'ward_members' and tag_id in (select id from tags where name in ( 'single-sisters' ))")
    .asCallback((err, ids) => cb());
  }, 
  cleanTags: (cb) => {
    db.schema.raw("delete from tags where name in ( 'single-sisters' )")
    .asCallback((err, ids) => cb());
  }, 
  holdaway: (cb) => {
    db.schema.raw("select id from ward_members where headOfHouse_gender = 'FEMALE'")
    .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "single-sisters", "Single sisters in the ward", ids.map(id => id.id), cb));
  }, 
}, 
(err, res) => {
  console.log("DONE", err, res);
})
