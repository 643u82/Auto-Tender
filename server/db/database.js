const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'car_tender.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
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
`);

// Migration: Check if admins table exists and migrate to users if needed
try {
  const adminTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'").get();
  if (adminTable) {
    const admins = db.prepare("SELECT * FROM admins").all();
    const insertUser = db.prepare("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, 'admin')");
    
    admins.forEach(admin => {
      insertUser.run(admin.username, admin.password_hash);
    });
    
    // Optional: Drop admins table after successful migration
    // db.exec("DROP TABLE admins");
  }
} catch (error) {
  console.error('Migration error:', error);
}

module.exports = db;
