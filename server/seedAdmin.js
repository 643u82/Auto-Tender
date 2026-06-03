const bcrypt = require('bcrypt');
const { dbRun, dbGet, pool } = require('./db/database');
require('dotenv').config();

async function seedAdmin() {
  try {
    const email = 'Administrator@autotender.com';
    const password = 'Am_798844';
    const name = 'System Administrator';

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      console.log('Admin user already exists. Updating password and role...');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      await dbRun(
        'UPDATE users SET password_hash = ?, role = ? WHERE email = ?',
        [passwordHash, 'admin', email]
      );
      console.log('Admin user updated successfully.');
    } else {
      console.log('Creating admin user...');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      await dbRun(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES (?, ?, ?, 'admin')`,
        [email, passwordHash, name]
      );
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    // Close the pool so the script exits
    await pool.end();
  }
}

seedAdmin();
