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

// todo: use Object.keys on filters instead; add 'other-neighborhoods' separately
const districtNames = ['hackberry', 'serrata', 'samara', 'syracuse', 'sterling-loop', 'dry-creek', 'silver-oak', 'quivira', 'alloy-m', 'alloy-n', 'alloy-p', 'alloy-q', 'other-neighborhoods'];
const districtNamesList = districtNames.map(d => `'${d}'` ).join(', ');

const filters = {
  'hackberry': "upper(address) like '%Hackberry%'", 
  'serrata': "upper(address) like '%Serrata%'",
  'samara': "upper(address) like '%Samara%'",
  'syracuse': "upper(address) like '%Syracuse%'",
  'sterling-loop': "upper(address) like '%Sterling%'",
  'dry-creek': "upper(address) like '%Dry Creek%'",
  'silver-oak': "upper(address) like '%Silver Oak%'",
  'quivira': "upper(address) like '%Quivira%'",
  'alloy-m': "upper(address) like '%100 S Geneva%' and upper(address) like '% M%'",
  'alloy-n': "upper(address) like '%100 S Geneva%' and upper(address) like '% N%'",
  'alloy-p': "upper(address) like '%100 S Geneva%' and upper(address) like '% P%'",
  'alloy-q': "upper(address) like '%100 S Geneva%' and upper(address) like '% Q%'",
}
/*

const filterNames = Object.keys(filters)
let res = filterNames.map(name => {
  const filter = filters[name];
  const districtFilter = `
    '${name}': (cb) => {
      db.schema.raw("select id from ward_members where ${filter}")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "${name}", "Neighborhood where members live", ids.map(id => id.id), cb));
    },`
  return districtFilter
})
console.log(res.join(''))


const otherFilters = filterNames.map(name => {
  const filter = filters[name];
  return `id not in (select id from ward_members where ${filter})`
})
console.log(`
    'other-neighborhoods': (cb) => {
      db.schema.raw("select id from ward_members where ${otherFilters.join(' and ')}")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "other-neighborhoods", "Neighborhood where members live", ids.map(id => id.id), cb));
    }, 
`)

*/

async.series({
  cleanTagAssociations: (cb) => {
    db.schema.raw(`delete from tag_associations where association_type = 'ward_members' and tag_id in (select id from tags where name in ( ${districtNamesList} ))`)
    .asCallback((err, ids) => cb());
  }, 
  cleanTags: (cb) => {
    db.schema.raw("delete from tags where name in ( ${districtNamesList} )")
    .asCallback((err, ids) => cb());
  }, 

    'hackberry': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Hackberry%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "hackberry", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'serrata': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Serrata%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "serrata", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'samara': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Samara%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "samara", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'syracuse': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Syracuse%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "syracuse", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'sterling-loop': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Sterling%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "sterling-loop", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'dry-creek': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Dry Creek%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "dry-creek", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'silver-oak': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Silver Oak%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "silver-oak", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'quivira': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%Quivira%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "quivira", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'alloy-m': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% M%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "alloy-m", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'alloy-n': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% N%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "alloy-n", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'alloy-p': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% P%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "alloy-p", "Neighborhood where members live", ids.map(id => id.id), cb));
    },
    'alloy-q': (cb) => {
      db.schema.raw("select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% Q%'")
      .asCallback((err, ids) => TagAssociation.createWithAssociations("ward_members", "alloy-q", "Neighborhood where members live", ids.map(id => id.id), cb));
    },

    'other-neighborhoods': (cb) => {
      db.schema.raw("select id from ward_members where id not in (select id from ward_members where upper(address) like '%Hackberry%') and id not in (select id from ward_members where upper(address) like '%Serrata%') and id not in (select id from ward_members where upper(address) like '%Samara%') and id not in (select id from ward_members where upper(address) like '%Syracuse%') and id not in (select id from ward_members where upper(address) like '%Sterling%') and id not in (select id from ward_members where upper(address) like '%Dry Creek%') and id not in (select id from ward_members where upper(address) like '%Silver Oak%') and id not in (select id from ward_members where upper(address) like '%Quivira%') and id not in (select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% M%') and id not in (select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% N%') and id not in (select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% P%') and id not in (select id from ward_members where upper(address) like '%100 S Geneva%' and upper(address) like '% Q%')")
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


