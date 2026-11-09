const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const Building = require('./models/Building'); // Import your model

dotenv.config();
connectDB();

const app = express();
app.use(cors()); // Enable CORS so React can talk to Node
app.use(express.json()); // Allows Express to parse incoming JSON payloads

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hi from the backend server!' });
});

// 1. LOAD (GET) all buildings from the database
app.get('/api/buildings', async (req, res) => {
  try {
    const buildings = await Building.find(); // Fetches all documents from MongoDB
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

// 2. SAVE (POST) a new Building to the database
// 2. SAVE (POST) a new Building to the database with classification
app.post('/api/buildings', async (req, res) => {
  try {
    const { buildName, address, classification } = req.body;
    
    // Create a new document instance including classification
    const newBuilding = new Building({ 
      buildName, 
      address, 
      classification 
    });
    
    // Save it to MongoDB Atlas
    const savedBuilding = await newBuilding.save();
    
    res.status(201).json(savedBuilding);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save building' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));