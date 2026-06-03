const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../db/database');

// GET /api/tenders - List all open tenders with media counts
router.get('/', async (req, res) => {
  try {
    const tenders = await dbAll(`
      SELECT t.*, 
      (SELECT COUNT(*) FROM tender_media WHERE tender_id = t.id) as media_count,
      (SELECT filename FROM tender_media WHERE tender_id = t.id AND type = 'image' LIMIT 1) as cover_image
      FROM tenders t
      WHERE t.status = 'open'
      ORDER BY t.created_at DESC
    `);

    res.json(tenders);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const optionalAuthMiddleware = require('../middleware/optionalAuth');

// GET /api/tenders/:id - Full tender detail with all media (Paywalled)
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user; // Set by optionalAuthMiddleware if valid token

  try {
    const tender = await dbGet('SELECT * FROM tenders WHERE id = ?', [id]);

    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    const media = await dbAll('SELECT * FROM tender_media WHERE tender_id = ?', [id]);

    // Check if the user is authorized to view full details
    let isLocked = true;

    let paymentStatusObj = null;

    if (user) {
      if (user.role === 'admin') {
        isLocked = false;
      } else {
        // Check for specific document payment
        const payment = await dbGet(
          "SELECT status, admin_note FROM payments WHERE user_id = ? AND tender_id = ? ORDER BY created_at DESC LIMIT 1",
          [user.id, id]
        );

        if (payment) {
          paymentStatusObj = payment;
          if (payment.status === 'approved') {
            isLocked = false;
          }
        }
        
        // Also check active subscription if not already unlocked
        if (isLocked) {
          const userRecord = await dbGet('SELECT subscription_expires_at FROM users WHERE id = ?', [user.id]);
          if (userRecord && userRecord.subscription_expires_at && new Date(userRecord.subscription_expires_at) > new Date()) {
            isLocked = false;
          }
        }
      }
    }

    if (isLocked) {
      // Hide sensitive data
      const publicMedia = media.filter(m => m.type === 'image'); // E.g., show cover images but hide 'docs'
      // Or just send empty media array for documents and flag isLocked
      return res.json({ ...tender, media: publicMedia, isLocked: true, paymentStatus: paymentStatusObj });
    }

    res.json({ ...tender, media, isLocked: false, paymentStatus: paymentStatusObj });
  } catch (error) {
    console.error('Error fetching tender detail:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
