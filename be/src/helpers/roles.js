var async = require('async');
import db from './../../db'
import role from './../models/roles'

export const syncRoles = (req, res, next) => {
	const data = {}

	const tasks = [
		(cb) => {
			checkDatabase((err, rows) => {
				data.rows = rows;
				if (err) return cb(err);
				cb();
			});
		},
		(cb) => {
			populateDatabase((err, rows) => {
				data.rows = rows;
				if (err) return cb(err);
				cb();
			});
		},
	];
	
	async.series(tasks, (err) => {
			if (err) {
				if (err.message !== 'Database already populated') {
					return res.json({status: 'error', msg: 'something went wrong', err});
				}
			}

			console.log("roles count", data.rows.length);
			res.json(data);
	});
}

export const getRoles = (req, res, next) => {
	// role.all(req.query, (err, rows) => {
	role.all((err, rows) => {
		if (err) return res.json({status: 'error', msg: err.msg, err: err.raw});
		res.json({ rows });
	});
};

export const getRole = (req, res, next) => {
	res.json({ msg: "Code up #getRole" });
};

export const createRole = (req, res, next) => {
	res.json({ msg: "Code up #createRole" });
};

export const updateRole = (req, res, next) => {
	res.json({ msg: "Code up #updateRole" });
};

export const deleteRole = (req, res, next) => {
	res.json({ msg: "Code up #deleteRole" });
};

const checkDatabase = (callback) => {
	db.table("roles").select()
	.asCallback((err, rows) => {
		if (rows.length > 0) return callback(new Error("Database already populated"), rows);
		callback(err, rows);
	});
};

const populateDatabase = (callback) => {
	const allRoles = [
		{name: 'eq-pres', description: 'Member of the eq presidency'}, 
		{name: 'visitor', description: 'Assigned to help with eq family visits'}, 
		{name: 'interviewer', description: 'EQ President and his counselors (not secretaries)'}, 
	];

	const count = allRoles.length - 1;
	allRoles.forEach((role, index) => {
		db('roles')
		.insert(role)
		.asCallback((err, rows) => {
			if (err) return callback(err);
			console.log(`inserted role ${index}`, role.name);

			if (index >= count) return callback(null, allRoles);
		});	
	});
};

