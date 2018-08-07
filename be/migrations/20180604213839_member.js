
exports.up = function(knex, Promise) {

	return knex.schema.createTable('members', (table) => {
    table.increments('id').unsigned().primary()

		// strings
    table.string('address')
    table.string('birthDate')
    table.string('birthDateSort')
    table.string('email')
    table.string('endowed')
    table.string('formattedMrn')
    table.string('gender')
    table.string('genderLabelShort')
    table.string('group')
    table.string('householdEmail')
    table.string('householdPhone')
    table.string('htvtAssignments')
    table.string('htvtCompanions')
    table.string('mrn')
    table.string('name')
    table.string('initials')
    table.string('phone')
    table.string('priesthood')
    table.string('priesthoodCode')
    table.string('priesthoodType')
    table.string('sealedToSpouse')
    table.string('spokenName')
    table.string('sustainedDate')
    table.string('unitName')
    table.string('visible')

		// booleans
    table.boolean('adultAgeOrMarried')
    table.boolean('defaultClass')
    table.boolean('eligibleForHomeTeachingAssignment')
    table.boolean('nonMember')
    table.boolean('outOfUnitMember')
    table.boolean('setApart')
    table.boolean('validContactInfo')

		// integers
    table.integer('actualAge')
    table.integer('actualAgeInMonths')
    table.integer('age')
    table.integer('defaultClassTypeId')
    table.integer('genderCode')
    table.integer('nameOrder')
    table.integer('unitNumber')
    table.integer('memberId')

		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at')
		table.timestamp('archived_at')
	})
	// .then(() => ···)
	
};

exports.down = function(knex, Promise) {
  
};
