
exports.up = function(knex, Promise) {

	return knex.schema.createTable('roles', (table) => {
    table.increments('id').unsigned().primary()

		// strings
    table.string('name')
    table.string('description')

		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at')
	})
	// .then(() => ···)
	
};

exports.down = function(knex, Promise) {
  
};


