const express = require('express');
const router = express.Router();
const db = require('../db/database');
const path = require('path');
const fs = require('fs');

// DELETE /api/admin/media/:mediaId - Delete a single media file
router.delete('/:mediaId', (req, res) => {
  const { mediaId } = req.params;

  try {
    const file = db.prepare('SELECT * FROM tender_media WHERE id = ?').get(mediaId);

    if (!file) {
      return res.status(404).json({ message: 'Media not found' });
    }

    let folder = 'uploads/';
    if (file.type === 'image') folder += 'images/';
    else if (file.type === 'video') folder += 'videos/';
    else folder += 'docs/';
    
    const filePath = path.join(folder, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.prepare('DELETE FROM tender_media WHERE id = ?').run(mediaId);

    res.json({ message: 'Media file deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
