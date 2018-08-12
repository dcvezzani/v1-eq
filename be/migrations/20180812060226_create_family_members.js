
exports.up = function(knex, Promise) {
  return knex.schema.createTable('family_members', (table) => {
    table.increments('id').unsigned().primary()

    // strings
    table.string('type') // 'headOfHouse', 'spouse', 'children'
    table.string('preferredName')
    table.string('directoryName')
    table.string('gender')
    table.string('surname')

    // integers
    table.integer('individualId')
    table.integer('familyId')
  })
  .then(() => Promise.resolve())
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('family_members')
};

