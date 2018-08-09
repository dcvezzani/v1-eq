
exports.up = function(knex, Promise) {
	return knex.schema.createTable('tags', (table) => {
    table.increments('id').unsigned().primary()
  
		// strings
    table.string('name')
    table.string('description')
  });
};

exports.down = function(knex, Promise) {
  
};
