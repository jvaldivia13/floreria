const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'floreria_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Test database connection on module load
 */
async function testConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful. Current time:', result.rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Test connection when module is loaded
testConnection().catch((err) => {
  console.error('Failed to connect to database on startup:', err.message);
  process.exit(1);
});

module.exports = pool;
