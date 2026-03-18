const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Connected to PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
  process.exit(1);
});

// Convert SQLite-style ? placeholders to PostgreSQL $1, $2, $3...
function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

const db = {
  // Run INSERT / UPDATE / DELETE — returns { id, changes }
  runAsync(sql, params = []) {
    const pgSql = convertPlaceholders(sql) + ' RETURNING id';
    return pool.query(pgSql, params).then((res) => ({
      id: res.rows[0]?.id ?? null,
      changes: res.rowCount,
    })).catch((err) => {
      // If RETURNING id fails (e.g. UPDATE with no id col), retry without it
      if (err.message.includes('RETURNING')) {
        return pool.query(convertPlaceholders(sql), params).then((res) => ({
          id: null,
          changes: res.rowCount,
        }));
      }
      throw err;
    });
  },

  // SELECT single row
  getAsync(sql, params = []) {
    return pool.query(convertPlaceholders(sql), params).then((res) => res.rows[0] ?? null);
  },

  // SELECT multiple rows
  allAsync(sql, params = []) {
    return pool.query(convertPlaceholders(sql), params).then((res) => res.rows);
  },

  // Raw query (for migrations / schema setup)
  query(sql, params = []) {
    return pool.query(sql, params);
  },

  // For transaction support
  getClient() {
    return pool.connect();
  },
};

module.exports = db;
