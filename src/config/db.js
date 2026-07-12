const { Pool } = require('pg');

//used the pg library to establish a connection pool

// Create a new connection pool using the environment variables from .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export a helper function to run queries
module.exports = {
  query: (text, params) => pool.query(text, params),
};