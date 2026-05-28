const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to convert SQLite `?` to PostgreSQL `$1, $2`
const convertSql = (sql) => {
  let i = 1;
  return sql.replace(/\?/g, () => `$${i++}`);
};

const dbRun = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  // If it's an INSERT, try to return id to mimic lastInsertRowid
  let querySql = pgSql;
  if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
    querySql += ' RETURNING id';
  }
  
  // Handle SQLite INSERT OR IGNORE -> Postgres ON CONFLICT DO NOTHING
  querySql = querySql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
  // Note: True 'ON CONFLICT DO NOTHING' requires knowing the unique constraint, so this is a basic approximation.
  // For precise compatibility, queries might need manual adjustment.

  try {
    const res = await pool.query(querySql, params);
    return { 
      lastInsertRowid: res.rows[0]?.id || null, 
      changes: res.rowCount 
    };
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return { changes: 0 };
    }
    throw err;
  }
};

const dbGet = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  const res = await pool.query(pgSql, params);
  return res.rows[0];
};

const dbAll = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  const res = await pool.query(pgSql, params);
  return res.rows;
};

// Create tables if they don't exist (PostgreSQL dialect)
const initDatabase = async () => {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS tenders (
      id SERIAL PRIMARY KEY,
      tender_ref VARCHAR(255) UNIQUE,
      make VARCHAR(255),
      model VARCHAR(255),
      year INTEGER,
      mileage VARCHAR(255),
      color VARCHAR(255),
      transmission VARCHAR(255),
      fuel VARCHAR(255),
      condition VARCHAR(255),
      price REAL,
      currency VARCHAR(10) DEFAULT 'USD',
      deadline TIMESTAMP,
      status VARCHAR(50) DEFAULT 'draft',
      description TEXT,
      tags TEXT,
      posted_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tender_media (
      id SERIAL PRIMARY KEY,
      tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
      type VARCHAR(50),
      filename VARCHAR(255),
      original_name VARCHAR(255),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      username VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255),
      name VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      picture TEXT,
      role VARCHAR(50) DEFAULT 'user',
      subscription_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payment_type VARCHAR(50) DEFAULT 'document',
      tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
      transaction_ref VARCHAR(255) NOT NULL,
      amount REAL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(createTablesSQL);
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
};

// Initialize database on startup
initDatabase()
  .then(() => console.log('PostgreSQL Database initialized successfully'))
  .catch(err => console.error('PostgreSQL initialization error:', err));

module.exports = { pool, dbRun, dbGet, dbAll };
