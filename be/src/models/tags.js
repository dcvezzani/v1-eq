import db from './../../db'
import _ from 'lodash'

const reportError = (callback, trx, msg, err, query) => {
  if (trx) trx.rollback();
  return callback({msg, raw: err, query: query.toSQL()});
};

const Tag = {
	all: (callback) => {
		let query = db('tags').select();
		console.log("query.toString()", query.toString());

		query.orderBy('name', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch tags', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},

	groupedByMembers: (pattern, callback) => {
		let query = db('tags').innerJoin('member_tags', 'tags.id', 'member_tags.tag_id').innerJoin('members', 'members.id', 'member_tags.member_id').select(['members.id', 'members.name', 'members.phone', 'members.email', {tag_name: 'tags.name'}]).where('tags.name', 'like', `%${pattern}%`).orderBy('tags.name', 'asc', 'members.name', 'asc')
  console.log(">>>fetchMembers", query.toString());
    
		query.asCallback((err, rows) => {
			if (err) return callback({msg: `Unable to fetch members for pattern '${pattern}'`, raw: err, query: query.toString()});
			callback(err, rows);
		});
	},

	loadMemberIds: (tag_id, callback) => {
		let query = db('member_tags').select(['member_id']).where({tag_id});
		console.log("query.toString()", query.toString());

		query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch members associated with tag', raw: err, query: query.toString()});
			callback(err, rows.map(row => row.member_id));
		});
	},

	apply: (memberIds, tagIds, callback) => {
    let newRows = [];
    tagIds.forEach(tag_id => {
      const query = db('member_tags').select().where({tag_id});
      query.asCallback((err, rows) => {
        if (err) return callback({msg: 'Unable to apply tags to members', raw: err, query: query.toSQL()});
        const curMemberIds = rows.map(member => member.id);
        const newMemberIds = _.difference(memberIds, curMemberIds);

        console.log(">>>apply", newMemberIds, tag_id);
        newMemberIds.forEach(member_id => {
          newRows.push({member_id, tag_id})
        });
      });
    });

		const query = db('member_tags').insert(newRows);
		query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to apply tags to members', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},

	remove: (name, callback) => {
    const query = db('tags').select().where({ name })
    query.asCallback((err, rows) => {
      if (err) return reportError(callback, trx, `Unable to locate tag with name: ${name}`, err, query2);
      const tagIds = rows.map(row => row.id);

      db.transaction(function(trx) {
        const query2 = db('tags').transacting(trx).whereIn('id', tagIds).del();
        query2.asCallback((err, rows) => {
          if (err) return reportError(callback, trx, 'Unable to delete tag(s)', err, query2);

          const query3 = db('member_tags').transacting(trx).whereIn('tag_id', tagIds).del();
          query3.asCallback((err, rows) => {
            if (err) return reportError(callback, trx, 'Unable to remove member/tag associations', err, query3);
            trx.commit();
            callback(err, rows);
          });
        });
      });
    });
	},

	removeMembers: (name, memberIds, callback) => {
    const query = db('tags').select().where({ name })
    query.asCallback((err, rows) => {
      if (err) return reportError(callback, null, `Unable to locate tag with name: ${name}`, err, query2);
      const tagIds = rows.map(row => row.id);

      let query3 = db('member_tags').whereIn('tag_id', tagIds);
      console.log(">>>name, memberIds", name, JSON.stringify(memberIds));
      if (memberIds) query3 = query3.whereIn('member_id', memberIds);
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

	createWithMembers: (name, description, memberIds, callback) => {
    db.transaction(function(trx) {
      const query = db('tags').transacting(trx).insert({ name, description });

      query.asCallback((err, rows) => {
        if (err) return reportError(trx, 'Unable to create tag', err, query);

        const query2 = db('tags').transacting(trx).select('id').where({name}).first();
        query2.asCallback((err, row) => {
          if (err) return reportError(trx, 'Unable to fetch newly created tag id', err, query2);

          let rows = [];
          memberIds.forEach(member_id => {
            rows.push({ tag_id: row.id, member_id })
          });
          const query3 = db('member_tags').transacting(trx).insert(rows);
          query3.asCallback((err, row) => {
            if (err) return reportError(trx, 'Unable to apply tags to members', err, query3);
            trx.commit();
            callback(err, {rows, name});
          });
        });
      });
    });
	},
};

export default Tag;

