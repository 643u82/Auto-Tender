const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../db/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    if (file.mimetype.startsWith('image/')) folder += 'images/';
    else if (file.mimetype.startsWith('video/')) folder += 'videos/';
    else folder += 'docs/';
    
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
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB max (for videos)
  }
});

// GET /api/admin/tenders - All tenders
router.get('/', async (req, res) => {
  try {
    const tenders = await dbAll(`
      SELECT t.*, 
      (SELECT COUNT(*) FROM tender_media WHERE tender_id = t.id) as media_count
      FROM tenders t
      ORDER BY t.created_at DESC
    `);
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/tenders - Create tender
router.post('/', upload.any(), async (req, res) => {
  const {
    tender_ref, make, model, year, mileage, color, transmission,
    fuel, condition, price, currency, deadline, status, description, tags
  } = req.body;

  try {
    const posted_date = new Date().toISOString();
    const result = await dbRun(
      `INSERT INTO tenders (
        tender_ref, make, model, year, mileage, color, transmission,
        fuel, condition, price, currency, deadline, status, description, tags, posted_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tender_ref, make, model, year, mileage, color, transmission,
        fuel, condition, price, currency, deadline, status, description, tags, posted_date
      ]
    );

    const tenderId = result.lastInsertRowid;

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        let type = 'document';
        if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        
        await dbRun(
          `INSERT INTO tender_media (tender_id, type, filename, original_name)
           VALUES (?, ?, ?, ?)`,
          [tenderId, type, file.filename, file.originalname]
        );
      }
    }

    res.status(201).json({ id: tenderId, message: 'Tender created successfully' });
  } catch (error) {
    console.error('Error creating tender:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/tenders/:id - Update tender
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    tender_ref, make, model, year, mileage, color, transmission,
    fuel, condition, price, currency, deadline, status, description, tags
  } = req.body;

  try {
    await dbRun(
      `UPDATE tenders SET
        tender_ref = ?, make = ?, model = ?, year = ?, mileage = ?, 
        color = ?, transmission = ?, fuel = ?, condition = ?, 
        price = ?, currency = ?, deadline = ?, status = ?, 
        description = ?, tags = ?
      WHERE id = ?`,
      [
        tender_ref, make, model, year, mileage, color, transmission,
        fuel, condition, price, currency, deadline, status, description, tags, id
      ]
    );

    res.json({ message: 'Tender updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/tenders/:id/status - Toggle status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await dbRun('UPDATE tenders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/tenders/:id - Delete tender and files
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get all media files first
    const media = await dbAll('SELECT * FROM tender_media WHERE tender_id = ?', [id]);

    // Delete files from disk
    media.forEach(file => {
      let folder = 'uploads/';
      if (file.type === 'image') folder += 'images/';
      else if (file.type === 'video') folder += 'videos/';
      else folder += 'docs/';
      
      const filePath = path.join(folder, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete from DB (tender_media rows will be deleted by ON DELETE CASCADE)
    await dbRun('DELETE FROM tenders WHERE id = ?', [id]);

    res.json({ message: 'Tender and associated files deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
