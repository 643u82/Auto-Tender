require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const publicTenderRoutes = require('./routes/tenders');
const adminTenderRoutes = require('./routes/adminTenders');
const mediaRoutes = require('./routes/media');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
const uploadDirs = ['uploads/images', 'uploads/videos', 'uploads/docs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));
app.use('/uploads/docs', express.static(path.join(__dirname, 'uploads/docs')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenders', publicTenderRoutes);

const paymentRoutes = require('./routes/payments');

// Protected Admin Routes
app.use('/api/admin/tenders', authMiddleware, adminTenderRoutes);
app.use('/api/admin/media', authMiddleware, mediaRoutes);
app.use('/api/payments', paymentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
