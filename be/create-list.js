import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import db from './db';
import Member from './src/models/members-02';
import Tag from './src/models/tags';

/*
node_modules/.bin/babel-node create-list.js
 * */

const batchSize = 8;
const tagPrefix = "move-in";
let idx = 0;
const batches = {};
Member.allNotArchived((err, rows) => {
  rows = _.shuffle(rows);
  while(rows.length > batchSize) {
    idx += 1
    const tagName = `${tagPrefix}-${_.padStart(idx, 2, '0')}`

    const batch = rows.slice(rows.length - batchSize, rows.length)
    // console.log("batch", batch.length)
    // console.log("rows", rows.length)
    rows.length -= batchSize

    batches[tagName] = batch

    // Tag.fetch(tagName, (err, res) => {
    //   console.log("Fetching tag", err, res);
    // })
  }

  idx += 1
  const tagName = `${tagPrefix}-${idx}`
  const batch = rows.slice(rows.length - batchSize, rows.length)
  console.log("batch", batch.length)
  console.log("rows", rows.length)
  batches[tagName] = batch

  // console.log("batches", batches)

  _.forEach(batches, (members, tagName) => {
    // console.log("tagName", tagName);
    Tag.fetch(tagName, (err, tag) => {
      // console.log("Fetching tag", err, tag);
      if (tag.length === 0) {
        // console.log(`Creating tag: ${tagName}`)
        Tag.create(tagName, "Volunteers willing to help with move-ins", (err, res2) => {
          console.log(`Created tag: ${tagName}`, err, res2)
        });
      } else {
        // console.log(`Tag already exists: ${tagName}`, err, tag[0].id, members[0].id)

        const batchInsert = members.map(member => ({tag_id: tag[0].id, member_id: member.id}));
        console.log(`batchInsert`, batchInsert)

        // comment this section out to tag members
        Member.tagMembers(batchInsert, (err, rows3) => {
          console.log(`Member.tagMembers`, err, rows3)
        });
      }
    })
    
  })
})

// Tag.create("move-in-01", "Volunteers willing to help with move-ins", (err, res) => {
//   console.log("Created tag?", err, res)
// })

