
exports.up = function(knex, Promise) {
	return knex.schema.createTable('member_tags', (table) => {
    table.increments('id').unsigned().primary()
  
		// integers
    table.integer('member_id')
    table.integer('tag_id')
  });
};

exports.down = function(knex, Promise) {
  
};

