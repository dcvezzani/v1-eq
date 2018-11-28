
exports.up = function(knex, Promise) {

	return knex.schema.createTable('visitors', (table) => {
    table.increments('id').unsigned().primary()

		// foreign keys
    table.integer('visit_id').unsigned(); // visits
    table.integer('member_id').unsigned(); // members

		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at').defaultTo(knex.fn.now())
	})
	// .then(() => ···)
	
};

exports.down = function(knex, Promise) {
  
};

