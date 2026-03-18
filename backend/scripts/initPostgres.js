/**
 * initPostgres.js
 * Initialises the PostgreSQL database schema for Vigilo EHS.
 * Run with: node scripts/initPostgres.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../../database/schema.pg.sql');

async function init() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('✅ Schema applied successfully');

    // Create default SuperAdmin if not exists
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('Admin123!', 10);
    await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, job_title, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@vigilo.io', hash, 'Administrator', 'Safety Manager', 'SuperAdmin', 1]);
    console.log('✅ Default admin user ready  (admin / Admin123!)');

  } catch (err) {
    console.error('❌ Init failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

init();
