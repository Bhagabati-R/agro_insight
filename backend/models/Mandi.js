const mongoose = require('mongoose');

const mandiSchema = new mongoose.Schema({
  marketName: { type: String, required: true },
  crop: { type: String, required: true },       // crop name this price applies to
  price: { type: Number, required: true },       // price per kg offered (₹)
});

module.exports = mongoose.model('Mandi', mandiSchema);
