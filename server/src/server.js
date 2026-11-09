const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(cors()); // <-- Enable CORS so React can talk to Node
app.use(express.json()); // Allows Express to parse incoming JSON payloads

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hi lfegewgefhe backend server!' });
});
// Your routes will go here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const Post = require('./models/Post'); // Import your model

// 1. LOAD (GET) all posts from the database
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find(); // Fetches all documents from MongoDB
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// 2. SAVE (POST) a new post to the database
app.get('/api/posts', async (req, res) => {
  // ...
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Create a new document instance using your Mongoose model
    const newPost = new Post({ title, content });
    
    // Save it to MongoDB Atlas
    const savedPost = await newPost.save();
    
    res.status(201).json(savedPost); // Return the saved document back
  } catch (error) {
    res.status(400).json({ error: 'Failed to save post' });
  }
});