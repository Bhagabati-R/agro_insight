const express  = require('express');
const multer   = require('multer');
const router   = express.Router();
const {
  getAllCrops,
  getCropByName,
  getCropMandiPrices,
  identifyCrop,
} = require('../controllers/cropController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'));
    cb(null, true);
  },
});

// List all crops
router.get('/crops', getAllCrops);

// Get full info for one crop
router.get('/crops/:name', getCropByName);

// Get live mandi prices for a crop
router.get('/crops/:name/mandi', getCropMandiPrices);

// Identify crop from uploaded image
router.post('/identify', upload.single('image'), identifyCrop);

module.exports = router;
