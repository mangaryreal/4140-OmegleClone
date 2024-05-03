const pg = require("pg");
require("dotenv").config()


/**
 * @description utilities for database connections
 * 
 * @component database
 * @returns null
 * @export {pg.Pool} pool
 */

// PostgreSQL pool connection
const pool = new pg.Pool({
  database: "omegle_clone_database",
  user: "omegle_clone_database_user",
  password: "SQsqpYoKZt2bleZbR9npPhc6IXUpfFP9",
  host: "dpg-copqgoq1hbls73dkq440-a.singapore-postgres.render.com",
  ssl: true
})

module.exports = pool