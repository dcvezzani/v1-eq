
exports.up = function(knex, Promise) {
	return knex.schema.createTable('families', (table) => {
    table.increments('id').unsigned().primary()

		// strings
    table.string('coupleName')
    table.string('householdName')

		// integers
    table.integer('headOfHouseIndividualId')
	})
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('families');
};
