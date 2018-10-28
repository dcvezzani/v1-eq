import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import db from './db';
import TagAssociation from './src/models/tag_associations';
import Tag from './src/models/tags';

/*
node_modules/.bin/babel-node tag-members.js
 */

const associationIds = [1699810481, 943594479];
// const associationIds = [];
// const associationIds = [3740717047, 906971831, 6396643461, 3696620650, 2801880288, 4772666515];
const tagName = "visited";

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
