import db from './../../db'

const member = {
	xall: (callback) => {
		db('members').select()
		.orderBy('name', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err});
			callback(err, rows);
		});
	},

	all: (filter, callback) => {
		let query = db('members').select();

		if (typeof filter === 'function') {
			callback = filter;

		} else if (filter) {
			let filterCopy = JSON.parse(JSON.stringify(filter));
			console.log("filter", filterCopy);

			if (filterCopy.groups) {
				query = query.whereIn('group', filterCopy.groups);
				delete filterCopy.groups;
			}

			if (filterCopy.like) {
				query = query.whereRaw('name like ?', [`%${filterCopy.like}%`])
				delete filterCopy.like;
			}

			if (Object.keys(filterCopy).length > 0) {
				query = query.where(filterCopy);
			}
		}

		console.log("query.toString()", query.toString());

		query.orderBy('name', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	
	show: (id, callback) => {
		db('members').select()
		.where({id})
		.first()
		.asCallback((err, row) => {
			if (err) return callback({msg: 'Unable to fetch record', raw: err});
			callback(err, row);
		});
	},

	create: (attrs, callback) => {
		db('members')
		.insert(attrs)
		.returning('*')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to insert record(s)', raw: err});
			callback(err, rows);
		});	
	},

	update: (id, attrs, callback) => {
		db('members')
		.where({id})
		.update(attrs)
		.returning('*')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to update record', raw: err});
			callback(err, rows);
		});	
	},
};

export default member;
