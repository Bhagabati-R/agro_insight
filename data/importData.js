/**
 * Run from backend folder: node ../data/importData.js
 * Imports crops.csv and mandis.csv into MongoDB.
 * Requires MONGO_URI in backend/.env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Crop = require('./models/Crop');
const Mandi = require('./models/Mandi');

function parseCSV(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return headers.reduce((obj, h, i) => {
      const val = values[i].trim();
      obj[h.trim()] = isNaN(val) ? val : Number(val);
      return obj;
    }, {});
  });
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const crops = parseCSV(path.join(__dirname, '../data/crops.csv'));
  const mandis = parseCSV(path.join(__dirname, '../data/mandis.csv'));

  await Crop.deleteMany({});
  await Mandi.deleteMany({});

  await Crop.insertMany(crops);
  await Mandi.insertMany(mandis);

  console.log(`✅ Imported ${crops.length} crops and ${mandis.length} mandis`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
