const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/tenders - List all open tenders with media counts
router.get('/', (req, res) => {
  try {
    const tenders = db.prepare(`
      SELECT t.*, 
      (SELECT COUNT(*) FROM tender_media WHERE tender_id = t.id) as media_count,
      (SELECT filename FROM tender_media WHERE tender_id = t.id AND type = 'image' LIMIT 1) as cover_image
      FROM tenders t
      WHERE t.status = 'open'
      ORDER BY t.created_at DESC
    `).all();

    res.json(tenders);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tenders/:id - Full tender detail with all media
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const tender = db.prepare('SELECT * FROM tenders WHERE id = ?').get(id);

    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    const media = db.prepare('SELECT * FROM tender_media WHERE tender_id = ?').all(id);

    res.json({ ...tender, media });
  } catch (error) {
    console.error('Error fetching tender detail:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
