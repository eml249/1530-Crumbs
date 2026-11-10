const mongoose = require('mongoose');

// Connects with the READ-ONLY credentials. This server deliberately has no
// fallback to the main server's MONGODB_URI, so it can't write by accident.
async function connectDB() {
  const uri = process.env.READ_MONGODB_URI;
  if (!uri) {
    console.error('READ_MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected (read-only user): ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
