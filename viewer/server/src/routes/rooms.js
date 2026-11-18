const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET all rooms (or filter by building/availability)
router.get('/', async (req, res) => {
  try {
    const { building, available } = req.query;
    let query = {};
    
    if (building) query.inBuilding = building;
    if (available !== undefined) query.available = available === 'true';

    const rooms = await Room.find(query);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new room
router.post('/', async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
