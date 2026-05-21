const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db/database');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register - Email/Password Registration
router.post('/register', async (req, res) => {
  const { email, password, name, username } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR (username IS NOT NULL AND username = ?)').get(email, username || null);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insert = db.prepare(`
      INSERT INTO users (email, username, password_hash, name, role)
      VALUES (?, ?, ?, ?, 'user')
    `);
    const result = insert.run(email, username || null, passwordHash, name);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role: 'user' },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_123',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user: {
        id: result.lastInsertRowid,
        email,
        name,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login - Unified Login (Admin & User)
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }

  try {
    // Check users table for email OR username
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier);

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_123',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/google - Google OAuth Login/Register
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'ID Token is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(googleId, email);

    if (!user) {
      // Register new user
      const insert = db.prepare(`
        INSERT INTO users (email, name, google_id, picture, role)
        VALUES (?, ?, ?, ?, 'user')
      `);
      const result = insert.run(email, name, googleId, picture);
      user = { id: result.lastInsertRowid, email, name, google_id: googleId, picture, role: 'user' };
    } else if (!user.google_id) {
      // Link Google account to existing email (if legacy user existed)
      db.prepare('UPDATE users SET google_id = ?, picture = ?, name = ? WHERE id = ?')
        .run(googleId, picture, name, user.id);
      user.google_id = googleId;
      user.picture = picture;
      user.name = name;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_123',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;
