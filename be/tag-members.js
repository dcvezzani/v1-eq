import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import db from './db';
import TagAssociation from './src/models/tag_associations';
import Tag from './src/models/tags';

/*
node_modules/.bin/babel-node tag-members.js
 */

const associationIds = [ 679788735, 980393084, 1493201575, 1610119595, 1884116100, 1904889839, 1935365788, 2279114990, 2298305116, 3659573346, 3732271111, 3761417061, 5711214272, 6186152688, 6405311555, 7864203481, 21200983239, 33557535057];

// const associationIds = [];
// const associationIds = [3740717047, 906971831, 6396643461, 3696620650, 2801880288, 4772666515];
const tagName = "other-neighborhoods";

Tag.createWithMembers(tagName, `Members who live in the ${tagName} area`, associationIds, (err, res) => {
  if (err) return console.error(`Unable to create list, ${tagName} (count: ${associationIds.length})`);
  console.log(`List created: ${tagName} (count: ${associationIds.length})`)
});
//	createWithMembers: (name, description, memberIds, callback) => {

/*
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
 * */

