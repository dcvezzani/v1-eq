import async from 'async';
import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import db from './db';
import TagAssociation from './src/models/tag_associations';
import Tag from './src/models/tags';

/*
node_modules/.bin/babel-node tag-members-neighborhoods.js
 */

const createWithMembers = (tagName, ids, callback) => {
  Tag.createWithMembers(tagName, `Members who live in the ${tagName} area`, ids, (err, res) => {
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
    db.schema.raw("delete from tag_associations where association_type = 'ward_members' and tag_id in (select id from tags where name in ( 'eastlake', 'meadows', 'alloy', 'holdaway', 'cottonwoods', 'other-neighborhoods' ))")
    .asCallback((err, ids) => cb());
  }, 
  cleanTags: (cb) => {
    db.schema.raw("delete from tags where name in ( 'eastlake', 'meadows', 'alloy', 'holdaway', 'cottonwoods', 'other-neighborhoods' )")
    .asCallback((err, ids) => cb());
  }, 
  cottonwoods: (cb) => {
    db.schema.raw("select id from ward_members where upper(address) like '%Hackberry%' or upper(address) like '%Serrata%' or upper(address) like '%Samara%' or upper(address) like '%Syracuse%'")
    .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "cottonwoods", "Neighborhood where members live", ids.map(id => id.id), cb));
  }, 
  // eastlake: (cb) => {
  //   db.schema.raw("select id from ward_members where archived_at is null and (upper(address) not like '%Dry%' and (upper(address) like '%180 S%' or upper(address) like '%140 S%' or upper(address) like '%1990 W%' or upper(address) like '%1850 W%'))")
  //   .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "eastlake", "Neighborhood where members live", ids.map(id => id.id), cb));
  // }, 
  meadows: (cb) => {
    db.schema.raw("select id from ward_members where upper(address) like '%Sterling%' or upper(address) like '%Silver Oak%' or upper(address) like '%Dry Creek%' or upper(address) like '%Quivira%'")
    .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "meadows", "Neighborhood where members live", ids.map(id => id.id), cb));
  }, 
  alloy: (cb) => {
    db.schema.raw("select id from ward_members where upper(address) like '%100 S Geneva%'")
    .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "alloy", "Neighborhood where members live", ids.map(id => id.id), cb));
  }, 
  holdaway: (cb) => {
    db.schema.raw("select id from ward_members where upper(address) like '%Holdaway%'")
    .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "holdaway", "Neighborhood where members live", ids.map(id => id.id), cb));
  }, 
  otherNeighborhoods: (cb) => {
    db.schema.raw("select id from ward_members where id not in (select id from ward_members where upper(address) like '%Holdaway%') and id not in (select id from ward_members where upper(address) like '%100 S Geneva%') and id not in (select id from ward_members where upper(address) like '%Sterling%' or upper(address) like '%Silver Oak%' or upper(address) like '%Dry Creek%' or upper(address) like '%Quivira%') and id not in (select id from ward_members where upper(address) like '%180 S%' or upper(address) like '%140 S%' or upper(address) like '%1990 W%' or upper(address) like '%1850 W%') and id not in (select id from ward_members where upper(address) like '%Hackberry%' or upper(address) like '%Serrata%' or upper(address) like '%Samara%' or upper(address) like '%Syracuse%')")
    .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "other-neighborhoods", "Neighborhood where members live", ids.map(id => id.id), cb));
  }, 
}, 
(err, res) => {
  console.log("DONE", err, res);
})

/*
const associationIds = [ 679788735, 980393084, 1493201575, 1610119595, 1884116100, 1904889839, 1935365788, 2279114990, 2298305116, 3659573346, 3732271111, 3761417061, 5711214272, 6186152688, 6405311555, 7864203481, 21200983239, 33557535057];


// const associationIds = [];
// const associationIds = [3740717047, 906971831, 6396643461, 3696620650, 2801880288, 4772666515];
const tagName = "other-neighborhoods";

Tag.createWithMembers(tagName, `Members who live in the ${tagName} area`, associationIds, (err, res) => {
  if (err) return console.error(`Unable to create list, ${tagName} (count: ${associationIds.length})`);
  console.log(`List created: ${tagName} (count: ${associationIds.length})`)
});
//	createWithMembers: (name, description, memberIds, callback) => {

Tag.fetch(tagName, (err, rows) => {
  console.log(">>>rows", err, rows);
  const tagId = rows[0].id

  const association_type = 'ward_members';

  if (associationIds.length > 0) {
    TagAssociation.addMembers(association_type, tagName, associationIds, (err, rows) => {
      console.log("Tag '${tagName}' (${tagId}) was added for member ids: ${associationIds}", err, rows);
    });
  } else {
    console.log("No updates made; empty array of ward_member ids");
  }
});


select * from ward_members where id in (select id from ward_members where upper(address) like '%180 S%' or upper(address) like '%140 S%' or upper(address) like '%1990 W%' or upper(address) like '%1850 W%')

select * from ward_members where id in (select id from ward_members where upper(address) like '%Sterling%' or upper(address) like '%Silver Oak%' or upper(address) like '%Dry Creek%' or upper(address) like '%Quivira%')

select * from ward_members where id in (select id from ward_members where upper(address) like '%100 S Geneva%')

select * from ward_members where id in (select id from ward_members where upper(address) like '%Holdaway%')

select id from ward_members where id not in (select id from ward_members where upper(address) like '%Holdaway%')
and id not in (select id from ward_members where upper(address) like '%100 S Geneva%')
and id not in (select id from ward_members where upper(address) like '%Sterling%' or upper(address) like '%Silver Oak%' or upper(address) like '%Dry Creek%' or upper(address) like '%Quivira%')
and id not in (select id from ward_members where upper(address) like '%180 S%' or upper(address) like '%140 S%' or upper(address) like '%1990 W%' or upper(address) like '%1850 W%')
 * */


