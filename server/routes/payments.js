const express = require('express');
const router = express.Router();
const { dbRun, dbAll, dbGet } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/payments/';
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/payments - Submit a manual payment with proof
router.post('/', authMiddleware, upload.single('payment_proof'), async (req, res) => {
  const { transaction_ref, payment_type, tender_id, amount } = req.body;
  const user_id = req.admin.id; // From decoded token

  if (!transaction_ref) {
    return res.status(400).json({ message: 'Transaction reference is required.' });
  }

  try {
    let payment_proof_url = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
        folder: 'autotender/payments'
      });
      payment_proof_url = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    await dbRun(
      'INSERT INTO payments (user_id, payment_type, tender_id, transaction_ref, amount, status, payment_proof) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, payment_type || 'document', tender_id || null, transaction_ref, amount || 0, 'pending', payment_proof_url]
    );
    res.status(201).json({ message: 'Purchase request submitted successfully. Awaiting verification.' });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/payments/my - List all payments for current user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const payments = await dbAll(`
      SELECT p.*, t.tender_ref, t.make, t.model 
      FROM payments p 
      LEFT JOIN tenders t ON p.tender_id = t.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.admin.id]);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/payments - List all payments (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const payments = await dbAll(`
      SELECT p.*, u.email, u.username, u.name as user_name, t.tender_ref 
      FROM payments p 
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN tenders t ON p.tender_id = t.id
      ORDER BY p.created_at DESC
    `);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/payments/:id/status - Approve or reject payment (Admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { id } = req.params;
  const { status, admin_note } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const payment = await dbGet('SELECT * FROM payments WHERE id = ?', [id]);
    if (!payment) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const approved_at = status === 'approved' ? new Date().toISOString() : null;

    await dbRun(
      'UPDATE payments SET status = ?, admin_note = ?, approved_by = ?, approved_at = ? WHERE id = ?', 
      [status, admin_note || null, req.admin.id, approved_at, id]
    );

    // If approved and it's a subscription, update user's expires_at
    if (status === 'approved' && payment.payment_type === 'subscription') {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await dbRun('UPDATE users SET subscription_expires_at = ? WHERE id = ?', [thirtyDaysFromNow, payment.user_id]);
    }

    res.json({ message: \`Purchase request \${status} successfully.\` });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
