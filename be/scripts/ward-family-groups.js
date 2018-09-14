import async from 'async'
import _ from 'lodash'
import db from '../db'
import WardMember from '../src/models/ward_members'
import Tag from '../src/models/tags'
import Tags from '../src/models/tag_associations'

/*
./node_modules/.bin/babel-node scripts/ward-family-groups.js
*/


// Tag.create("family-visits-alpha-01", "group to schedule for eq family visit on a given week", ()=>{});

Tags.all(WardMember.name, (err, tags) => {
  console.log("Tag, WardMember", err, tags);
});

WardMember.allNotArchived((err, members) => {
  const groupSize = 8;
  let familyGroups = [];
  let familyIds = _.shuffle(members.map(member => member.id));
  let idx = 0;
  let curError = null;

  while(familyIds.length > 0) {
    if (curError) {
      console.error("curError", curError);
      break;
    }

    idx += 1;
    const familyGroup = familyIds.slice((-1)*groupSize);
    const tagName = `family-visits-alpha-${_.padStart(idx, 2, '0')}`

    Tags.createWithAssociations(WardMember.name, tagName, "group to schedule for eq family visit on a given week", familyGroup, (err, {rows, name}) => {if (err) curError = err});

    familyGroups.push(familyGroup);
    const removeAmount = (familyIds.length < groupSize) ? familyIds.length : groupSize;
    familyIds.length = (familyIds.length - removeAmount);
  }

  console.log("family groups", familyGroups, members.length);
});

