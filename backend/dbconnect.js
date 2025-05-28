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
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true" ? true : false,
})

module.exports = pool