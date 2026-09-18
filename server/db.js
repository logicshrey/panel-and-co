const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<username>')) {
    console.warn(
      'MONGO_URI is missing or still a placeholder. API will run without MongoDB.',
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

function mongoStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, mongoStatus };
