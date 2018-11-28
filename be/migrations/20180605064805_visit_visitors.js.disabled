
exports.up = function(knex, Promise) {

	return knex.schema.createTable('visit_visitors', (table) => {
    table.increments('id').unsigned().primary()

		// foreign keys
    table.integer('member_visitor_id').unsigned(); // members
    table.integer('visit_id').unsigned();          // visits
		
		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at')
	})
	// .then(() => ···)
	
};

exports.down = function(knex, Promise) {
  
};


