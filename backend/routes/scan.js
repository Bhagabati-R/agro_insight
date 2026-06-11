const express = require('express');
const multer = require('multer');
const { scanCrop } = require('../controllers/scanController');

const router = express.Router();

// Store in memory (no disk writes needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

router.post('/scan', upload.single('image'), scanCrop);

module.exports = router;
