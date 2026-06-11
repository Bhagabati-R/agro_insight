const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  cost: { type: Number, required: true },   // cost per unit land (₹)
  yield: { type: Number, required: true },  // output per unit land (kg)
  price: { type: Number, required: true },  // selling price per kg (₹)
});

// Virtual: profit per unit land
cropSchema.virtual('profit').get(function () {
  return this.yield * this.price - this.cost;
});

module.exports = mongoose.model('Crop', cropSchema);
