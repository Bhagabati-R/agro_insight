require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const optimizeRoutes = require('./routes/optimize');
const scanRoutes     = require('./routes/scan');
const cropRoutes     = require('./routes/crops');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '20mb' }));

app.use('/api', optimizeRoutes);
app.use('/api', scanRoutes);
app.use('/api', cropRoutes);

app.get('/', (req, res) => res.json({ status: 'AgroInsight API running' }));

// Connect to MongoDB (cached for serverless)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('MongoDB connected');
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server on port ${PORT}`);
    });
  })
  .catch(console.error);

module.exports = app;