const db = require('./database');
const bcrypt = require('bcrypt');

async function seed() {
  const username = 'admin';
  const email = 'admin@autotender.com';
  const password = 'admin123';
  const saltRounds = 10;

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Use the users table instead of admins
    const insert = db.prepare(`
      INSERT OR IGNORE INTO users (email, username, password_hash, name, role) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(email, username, passwordHash, 'System Administrator', 'admin');

    if (result.changes > 0) {
      console.log('Admin user seeded successfully into users table');
    } else {
      console.log('Admin user already exists or migration handled it');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    process.exit();
  }
}

seed();
