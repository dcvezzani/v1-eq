const config = require('./knexfile');
const knex = require('knex')(config.development);

export default knex;
