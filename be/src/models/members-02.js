import db from './../../db'

const Member = {
  name: 'members', 
	all: (callback) => {
		let query = db('members').select();
		console.log("query.toString()", query.toString());

		query.orderBy('name', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	tagMember: (member_id, tag_id, callback) => {
		const query = db('member_tags').insert({ member_id, tag_id });

		query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to tag member', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	allNotArchived: (callback) => {
		let query = db('members').select().whereNull('archived_at');
		console.log("query.toString()", query.toString());

		query.orderBy('name', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
};

export default Member;
