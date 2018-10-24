import db from './../../db'

const WardMember = {
  name: 'ward_members', 
	all: (callback) => {
		let query = db('ward_members').select();
		console.log("query.toString()", query.toString());

		query.orderBy('coupleName', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	updateMemberContactInfo: (id, info, callback) => {
		let query = db('ward_members').where({ id })
      .update(info)
        
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to update contact info', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	tagMember: (member_id, tag_id, callback) => {
		const query = db('tag_associations').insert({ member_id, tag_id });
  
		query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to tag member', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	allNotArchived: (callback) => {
		let query = db('ward_members').select().whereNull('archived_at');
		console.log("query.toString()", query.toString());

		query.orderBy('coupleName', 'asc')
		.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	allNotArchivedWithOutTag: (tagName, callback) => {
    let query = db.raw("select ward_members.id, ward_members.coupleName, ward_members.phone, ward_members.email, ward_members.address, tags.name as tag_name from tags inner join tag_associations on tags.id = tag_associations.tag_id inner join ward_members on ward_members.id = tag_associations.association_id where ward_members.archived_at is null and ward_members.id not in (select tag_associations.association_id from tags inner join tag_associations on tags.id = tag_associations.tag_id where tag_associations.association_type = 'ward_members' and tags.name = 'visited') order by ward_members.coupleName");
      
		// let query = db('tags').innerJoin('tag_associations', 'tags.id', 'tag_associations.tag_id').innerJoin('ward_members', 'ward_members.id', 'tag_associations.association_id').select(['ward_members.id', 'ward_members.coupleName as name', 'ward_members.phone', 'ward_members.email', 'ward_members.address', {tag_name: 'tags.name'}]).whereNull('ward_members.archived_at').where('tags.name', '!=', `${tagName}`).orderBy('tags.name', 'asc', 'ward_members.coupleName', 'asc')
		console.log("query.toString()", query.toString());

    query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	allNotArchivedWithTag: (tagName, callback) => {
    let query = db.raw("select ward_members.id, ward_members.coupleName, ward_members.phone, ward_members.email, ward_members.address from ward_members where ward_members.id in (select tag_associations.association_id from tags inner join tag_associations on tags.id = tag_associations.tag_id where tag_associations.association_type = 'ward_members' and tags.name = 'visited') order by ward_members.coupleName");
		console.log("query.toString()", query.toString());

    query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
	allNotArchivedWithTags: (pattern, callback) => {
		// let query = db('ward_members').innerJoin('tag_associations', 'tags.id', 'tag_associations.tag_id').select().whereNull('ward_members.archived_at');

    // ['ward_members.id', 'ward_members.coupleName as name', db.raw("'' as phone"), db.raw("'' as email"), {tag_name: 'tags.name'}]
    // ['ward_members.id', 'ward_members.coupleName as name', ward_members.phone, ward_members.email, ward_members.address, {tag_name: 'tags.name'}]
		let query = db('tags').innerJoin('tag_associations', 'tags.id', 'tag_associations.tag_id').innerJoin('ward_members', 'ward_members.id', 'tag_associations.association_id').select(['ward_members.id', 'ward_members.coupleName as name', 'ward_members.phone', 'ward_members.email', 'ward_members.address', {tag_name: 'tags.name'}]).where('tags.name', 'like', `%${pattern}%`).orderBy('tags.name', 'asc', 'ward_members.coupleName', 'asc')
		console.log("query.toString()", query.toString());

    query.asCallback((err, rows) => {
			if (err) return callback({msg: 'Unable to fetch records', raw: err, query: query.toString()});
			callback(err, rows);
		});
	},
};


export default WardMember;
