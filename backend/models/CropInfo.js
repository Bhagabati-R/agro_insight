const mongoose = require('mongoose');

const cropInfoSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  aliases: [String],                    // alternate names
  scientificName: String,
  growingSeason: String,
  harvestTime: String,
  soilType: String,
  waterRequirement: { type: String, enum: ['Low', 'Medium', 'High'] },
  estimatedYield: String,
  diseases: [
    {
      name: String,
      symptoms: [String],
      treatment: [String],
    },
  ],
  pests: [
    {
      name: String,
      symptoms: [String],
      treatment: [String],
    },
  ],
  // Leaf/plant color signature for image-based matching
  colorProfile: {
    greenScore: { type: Number },   // expected green score range min
    yellowIndex: { type: Number },  // yellowing threshold
  },
});

module.exports = mongoose.model('CropInfo', cropInfoSchema);
