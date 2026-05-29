#!/usr/bin/env node

/**
 * Database initialization script
 * Executes the SQL schema to create all tables
 *
 * Usage:
 *   node scripts/init-db.js
 *
 * Prerequisites:
 *   - PostgreSQL must be running
 *   - Database "floreria_db" must already exist (run: createdb floreria_db)
 *   - .env file must be configured with database credentials
 */

const fs = require('fs');
const path = require('path');
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

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('Starting database initialization...');

    // Read the SQL schema file
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL schema
    await client.query(sql);

    console.log('Database schema created successfully!');
    console.log('Tables created:');
    console.log('  - categories');
    console.log('  - users');
    console.log('  - products');
    console.log('  - cart_items');
    console.log('  - orders');
    console.log('  - order_items');
    console.log('  - reviews');
    console.log('  - coupons');
    console.log('  - wishlist');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();
