
exports.up = function(knex, Promise) {

	return knex.schema.createTable('member_roles', (table) => {
    table.increments('id').unsigned().primary()

		// foreign keys
    table.integer('role_id').unsigned(); // roles
    table.integer('member_id').unsigned();          // members
		
		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at')
	})
	// .then(() => ···)
	
};

exports.down = function(knex, Promise) {
  
};



