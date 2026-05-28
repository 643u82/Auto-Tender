const express = require('express');
const router = express.Router();
const { dbRun, dbAll, dbGet } = require('../db/database');
const authMiddleware = require('../middleware/auth');

// POST /api/payments - Submit a manual payment
router.post('/', authMiddleware, async (req, res) => {
  const { transaction_ref, payment_type, tender_id, amount } = req.body;
  const user_id = req.admin.id; // From decoded token

  if (!transaction_ref || !payment_type) {
    return res.status(400).json({ message: 'Transaction reference and payment type are required.' });
  }

  try {
    await dbRun(
      'INSERT INTO payments (user_id, payment_type, tender_id, transaction_ref, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, payment_type, tender_id || null, transaction_ref, amount || 0, 'pending']
    );
    res.status(201).json({ message: 'Payment submitted successfully. Awaiting verification.' });
  } catch (error) {
    console.error('Error submitting payment:', error);
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
      SELECT p.*, u.email, u.username, t.tender_ref 
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
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const payment = await dbGet('SELECT * FROM payments WHERE id = ?', [id]);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await dbRun('UPDATE payments SET status = ? WHERE id = ?', [status, id]);

    // If approved and it's a subscription, update user's expires_at
    if (status === 'approved' && payment.payment_type === 'subscription') {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await dbRun('UPDATE users SET subscription_expires_at = ? WHERE id = ?', [thirtyDaysFromNow, payment.user_id]);
    }

    res.json({ message: `Payment ${status} successfully.` });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
