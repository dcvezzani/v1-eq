
exports.up = function(knex, Promise) {
  
	return knex.schema.createTable('ward_members', (table) => {
    table.increments('id').unsigned().primary()

    table.string('coupleName')
    table.string('phone')
    table.string('email')
    table.string('address')

    table.string('headOfHouse_preferredName')
    table.string('headOfHouse_directoryName')
    table.string('headOfHouse_gender')
    table.string('headOfHouse_surname')
    table.integer('headOfHouse_individualId')
    
    table.string('spouse_preferredName')
    table.string('spouse_directoryName')
    table.string('spouse_gender')
    table.string('spouse_surname')
    table.integer('spouse_individualId')

    table.string('isProfilePrivate')
    table.string('unitNo')
    table.integer('headOfHouseIndividualId')
    table.string('householdName')
    table.integer('numberOfChildren')

		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at')
		table.timestamp('archived_at')
  });
};

exports.down = function(knex, Promise) {
  
};

