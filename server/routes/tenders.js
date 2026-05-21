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

// GET /api/tenders/:id - Full tender detail with all media
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tender = await dbGet('SELECT * FROM tenders WHERE id = ?', [id]);

    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    const media = await dbAll('SELECT * FROM tender_media WHERE tender_id = ?', [id]);

    res.json({ ...tender, media });
  } catch (error) {
    console.error('Error fetching tender detail:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
