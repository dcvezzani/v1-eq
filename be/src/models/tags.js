import db from './../../db'

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

	apply: (memberIds, tagIds, callback) => {
    let rows = [];
    memberIds.forEach(member_id => {
      tagIds.forEach(tag_id => {
        rows.push({member_id, tag_id})
      });
    });

		const query = db('member_tags').insert(rows);

		query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to apply tags to members', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},

	create: (name, description, callback) => {
		const query = db('tags').insert({ name, description });

		query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to create tag', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
};

export default Tag;

