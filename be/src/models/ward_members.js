import db from './../../db'

const WardMember = {
	all: (callback) => {
		let query = db('ward_members').select();
		console.log("query.toString()", query.toString());

		query.orderBy('coupleName', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	// tagMember: (member_id, tag_id, callback) => {
	// 	const query = db('member_tags').insert({ member_id, tag_id });
  //
	// 	query.asCallback((err, rows) => {
	// 		if (err) return callback({msg: 'Unable to tag member', raw: err, query: query.toString()});
	// 		callback(err, rows);
	// 	});
	// },
	allNotArchived: (callback) => {
		let query = db('ward_members').select().whereNull('archived_at');
		console.log("query.toString()", query.toString());

		query.orderBy('coupleName', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
};

export default WardMember;
