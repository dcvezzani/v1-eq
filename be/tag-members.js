import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import db from './db';
import TagAssociation from './src/models/tag_associations';
import Tag from './src/models/tags';

/*
node_modules/.bin/babel-node tag-members.js
 */

const associationIds = [ 305952852, 485624609, 647557148, 668507827, 679788735, 897069089, 1050786697, 1561316594, 1846492758, 1915926963, 2278693283, 2542041932, 2770642514, 3041249635, 3740717047, 4302306913, 4772666515, 4987261313, 5175830203, 5548385237, 5691848189, 8012209859, 9910525394, 20355979728, 20653054124, 33557535057];

// const associationIds = [];
// const associationIds = [3740717047, 906971831, 6396643461, 3696620650, 2801880288, 4772666515];
const tagName = "single-sisters";

Tag.createWithMembers(tagName, `Single sisters in the ward`, associationIds, (err, res) => {
  if (err) return console.error(`Unable to create list, ${tagName} (count: ${associationIds.length})`);
  console.log(`List created: ${tagName} (count: ${associationIds.length})`)
});

/*
Tag.createWithMembers(tagName, `Members who live in the ${tagName} area`, associationIds, (err, res) => {
  if (err) return console.error(`Unable to create list, ${tagName} (count: ${associationIds.length})`);
  console.log(`List created: ${tagName} (count: ${associationIds.length})`)
});

 */

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

