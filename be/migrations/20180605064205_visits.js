
exports.up = function(knex, Promise) {

	return knex.schema.createTable('visits', (table) => {
    table.increments('id').unsigned().primary()

		// foreign keys
    table.integer('visit_visitors_id').unsigned(); // visit_visitors
    table.integer('member_visitee_id').unsigned(); // members
		
		// strings
    table.string('notes')

		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at')
	})
	// .then(() => ···)
	
};

exports.down = function(knex, Promise) {
  
};

