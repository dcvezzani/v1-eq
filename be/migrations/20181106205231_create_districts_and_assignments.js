
// node_modules/.bin/babel-node node_modules/.bin/knex migrate:latest

import async from 'async'

exports.up = function(knex, Promise) {
    return knex.schema.createTable('districts', function(t) {
        t.increments('id').unsigned().primary();
        t.dateTime('createdAt').notNull().defaultTo(knex.fn.now())
        t.dateTime('updatedAt').nullable();

        t.string('name').notNull();
        t.integer('leader_id').unsigned();
        t.string('leader_name').notNull();
        t.text('description').nullable();
    })
    .then(() => 
        knex.schema.createTable('district_assignments', function(t) {
            t.increments('id').unsigned().primary();
            t.integer('district_id').unsigned();
            t.integer('companionship_id').unsigned();
            t.dateTime('createdAt').notNull().defaultTo(knex.fn.now())
            t.dateTime('updatedAt').nullable();

            t.string('type').notNull();
            t.integer('legacyCmisId').unsigned();
            t.string('name').notNull();
            t.text('description').nullable();
        })
    )
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('district_assignments')
    .then(() => knex.schema.dropTableIfExists('districts'))

    // async.series({
    //   createDistricts: (cb) => {
    //       knex.schema.dropTableIfExists('district_assignments')
    //   }, 
    //   createAssignments: (cb) => {
    //       knex.schema.dropTableIfExists('districts')
    //   }, 
    // }, 
    // (err, res) => {
    //     console.log("DONE", err, res);
    // })
  
};
