const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'car_tender.db');
const db = new sqlite3.Database('./database.db');

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Helper function to wrap db.run in a promise
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
};

// Helper function to wrap db.get in a promise
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper function to wrap db.all in a promise
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Create tables if they don't exist
const initDatabase = async () => {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS tenders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tender_ref TEXT UNIQUE,
      make TEXT,
      model TEXT,
      year INTEGER,
      mileage TEXT,
      color TEXT,
      transmission TEXT,
      fuel TEXT,
      condition TEXT,
      price REAL,
      currency TEXT DEFAULT 'USD',
      deadline TEXT,
      status TEXT DEFAULT 'draft',
      description TEXT,
      tags TEXT,
      posted_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tender_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tender_id INTEGER,
      type TEXT,
      filename TEXT,
      original_name TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      username TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      google_id TEXT UNIQUE,
      picture TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  return new Promise((resolve, reject) => {
    db.exec(createTablesSQL, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Migration: Check if admins table exists and migrate to users if needed
const migrateAdmins = async () => {
  try {
    const adminTable = await dbGet("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'");
    if (adminTable) {
      const admins = await dbAll("SELECT * FROM admins");
      for (const admin of admins) {
        await dbRun(
          "INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, 'admin')",
          [admin.username, admin.password_hash]
        );
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Initialize database on startup
initDatabase()
  .then(() => migrateAdmins())
  .catch(err => console.error('Database initialization error:', err));

module.exports = { db, dbRun, dbGet, dbAll };
