
exports.up = function(knex, Promise) {

	return knex.schema.createTable('visits', (table) => {
    table.increments('id').unsigned().primary()

		// foreign keys
    table.integer('visitee_id').unsigned(); // visit_visitors
		
		// strings
    table.string('visitee_type')
    table.text('notes')

		// timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('visited_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at').defaultTo(knex.fn.now())
	})
	// .then(() => ···)
	
};

exports.down = function(knex, Promise) {
  
};

/*
CREATE TABLE `visits` (
	`id`	integer NOT NULL PRIMARY KEY AUTOINCREMENT,
	`visitee_id`	integer,
	`visitee_type`	varchar ( 255 ),
	`notes`	varchar ( 4000 ),
	`visited_at`	datetime DEFAULT CURRENT_TIMESTAMP,
	`created_at`	datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at`	datetime DEFAULT CURRENT_TIMESTAMP
);
 */
