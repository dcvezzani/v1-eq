
exports.up = function(knex, Promise) {
	return knex.schema.createTable('tag_associations', (table) => {
    table.increments('id').unsigned().primary()
  
		// strings
    table.string('association_type')
    
		// integers
    table.integer('association_id')
    table.integer('tag_id')

		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at').defaultTo(knex.fn.now())
  });
};

exports.down = function(knex, Promise) {
  
};
