import db from './../../db'
import _ from 'lodash'

const reportError = (callback, trx, msg, err, query) => {
  if (trx) trx.rollback();
  return callback({msg, raw: err, query: query.toSQL()});
};

const Tag = {
  name: 'tag_associations', 
	all: (association_type, callback) => {
		let query = db('tags').select('tags.*').innerJoin('tag_associations', 'tags.id', 'tag_associations.tag_id')
		console.log("query", query.toString());

		query.orderBy('tags.name', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch tags', raw: err, query: query.toString()});
		console.log("rows", rows);
			callback(err, rows);
		});
	},

	// groupedByMembers: (type, pattern, callback) => {
	// 	let query = db('tags').innerJoin('tag_associations', 'tags.id', 'tag_associations.tag_id').innerJoin('members', 'members.id', 'tag_associations.member_id').select(['members.id', 'members.name', 'members.phone', 'members.email', {tag_name: 'tags.name'}]).where('tags.name', 'like', `%${pattern}%`).orderBy('tags.name', 'asc', 'members.name', 'asc')
  // console.log(">>>fetchMembers", query.toString());
  //   
	// 	query.asCallback((err, rows) => {
	// 		if (err) return callback({msg: `Unable to fetch members for pattern '${pattern}'`, raw: err, query: query.toString()});
	// 		callback(err, rows);
	// 	});
	// },

	// loadMemberIds: (type, tag_id, callback) => {
	// 	let query = db('tag_associations').select(['member_id']).where({tag_id});
	// 	console.log("query.toString()", query.toString());

	// 	query.asCallback((err, rows) => {
	// 		if (err) return callback({msg: 'Unable to fetch members associated with tag', raw: err, query: query.toString()});
	// 		callback(err, rows.map(row => row.member_id));
	// 	});
	// },

	// apply: (type, memberIds, tagIds, callback) => {
  //   let newRows = [];
  //   tagIds.forEach(tag_id => {
  //     const query = db('tag_associations').select().where({tag_id});
  //     query.asCallback((err, rows) => {
  //       if (err) return callback({msg: 'Unable to apply tags to members', raw: err, query: query.toSQL()});
  //       const curMemberIds = rows.map(member => member.id);
  //       const newMemberIds = _.difference(memberIds, curMemberIds);

  //       console.log(">>>apply", newMemberIds, tag_id);
  //       newMemberIds.forEach(member_id => {
  //         newRows.push({member_id, tag_id})
  //       });
  //     });
  //   });

	// 	const query = db('tag_associations').insert(newRows);
	// 	query.asCallback((err, rows) => {
	// 		if (err) return callback({msg: 'Unable to apply tags to members', raw: err, query: query.toString()});
	// 		callback(err, rows);
	// 	});
	// },

	remove: (association_type, name, callback) => {
    const query = db('tags').select().where({ name })
    query.asCallback((err, rows) => {
      if (err) return reportError(callback, trx, `Unable to locate tag with name: ${name}`, err, query2);
      const tagIds = rows.map(row => row.id);

      db.transaction(function(trx) {
        const query2 = db('tags').transacting(trx).whereIn('id', tagIds).del();
        query2.asCallback((err, rows) => {
          if (err) return reportError(callback, trx, 'Unable to delete tag(s)', err, query2);

          const query3 = db('tag_associations').transacting(trx).whereIn('tag_id', tagIds).del();
          query3.asCallback((err, rows) => {
            if (err) return reportError(callback, trx, 'Unable to remove member/tag associations', err, query3);
            trx.commit();
            callback(err, rows);
          });
        });
      });
    });
	},

	removeMembers: (association_type, name, associationIds, callback) => {
    const query = db('tags').select().where({ name })
    query.asCallback((err, rows) => {
      if (err) return reportError(callback, null, `Unable to locate tag with name: ${name}`, err, query2);
      const tagIds = rows.map(row => row.id);

      let query3 = db('tag_associations').whereIn('tag_id', tagIds);
      console.log(">>>name, associationIds", name, JSON.stringify(associationIds));
      if (associationIds) query3 = query3.whereIn('association_id', associationIds);
      query3 = query3.del();
      query3.asCallback((err, rows) => {
        if (err) return reportError(callback, null, 'Unable to remove member/tag associations', err, query3);
        const tags = tagIds.map(tagId => ({id: tagId, name}));
        callback(err, {rows, tags});
      });
    });
	},

	create: (name, description, callback) => {
		const query = db('tags').insert({ name, description });

		query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to create tag', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},

	createWithAssociations: (association_type, name, description, associationIds, callback) => {
    db.transaction(function(trx) {
      const query = db('tags').transacting(trx).insert({ name, description });

      query.asCallback((err, rows) => {
        if (err) return reportError(trx, 'Unable to create tag', err, query);

        const query2 = db('tags').transacting(trx).select('id').where({name}).first();
        query2.asCallback((err, row) => {
          if (err) return reportError(trx, 'Unable to fetch newly created tag id', err, query2);

          let rows = [];
          associationIds.forEach(association_id => {
            rows.push({ association_type, tag_id: row.id, association_id })
          });
          const query3 = db('tag_associations').transacting(trx).insert(rows);
          query3.asCallback((err, row) => {
            if (err) return reportError(trx, `Unable to apply tags to ${association_type}`, err, query3);
            trx.commit();
            callback(err, {rows, name});
          });
        });
      });
    });
	},
};

export default Tag;

