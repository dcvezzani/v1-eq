import db from './../../db'

const Member = {
	all: (callback) => {
		let query = db('members').select();
		console.log("query.toString()", query.toString());

		query.orderBy('name', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	allInWard: (callback) => {
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
