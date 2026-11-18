const express = require('express');
const mongoose = require('mongoose');
const Building = require('../models/Building');
const Room = require('../models/Room');

const router = express.Router();

// Query-string filters /rooms accepts. Each entry turns the raw query string
// into the value used in the Mongo filter, or throws a message for a 400.
// To make another field filterable, add one entry here.
const FILTERABLE = {
  inBuilding: (v) => v,
  dataSource: (v) => v,
  available: (v) => {
    if (v === 'true') return true;
    if (v === 'false') return false;
    throw new Error('available must be "true" or "false"');
  },
  congestionIndex: (v) => {
    const n = Number(v);
    if (!Number.isInteger(n)) throw new Error('congestionIndex must be an integer');
    return n;
  },
};

// Same ordering everywhere: by building, then room number, then name (so 201A..201F stay in order).
const ROOM_SORT = { inBuilding: 1, roomNum: 1, roomName: 1 };

// GET /api/rooms
// GET /api/rooms?inBuilding=Hillman%20Library&available=true&congestionIndex=1
router.get('/rooms', async (req, res) => {
  try {
    const filter = {};
    for (const [field, parse] of Object.entries(FILTERABLE)) {
      const value = req.query[field];
      if (value === undefined) continue;
      if (typeof value !== 'string') {
        return res.status(400).json({ error: `${field} must be a single value` });
      }
      try {
        filter[field] = parse(value);
      } catch (e) {
        return res.status(400).json({ error: e.message });
      }
    }
    const rooms = await Room.find(filter).sort(ROOM_SORT).lean();
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/filters -> { inBuilding: [...], dataSource: [...], congestionIndex: [1,2,3] }
// The values that actually exist in the database, so the UI has no hard-coded lists.
router.get('/rooms/filters', async (req, res) => {
  try {
    const options = {};
    for (const field of ['inBuilding', 'dataSource', 'congestionIndex']) {
      const values = await Room.distinct(field);
      options[field] = values.filter((v) => v !== null && v !== undefined && v !== '').sort((a, b) =>
        typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)),
      );
    }
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch room filter options' });
  }
});

// GET /api/rooms/summary -> { total, available, unavailable, byBuilding: {...}, byCongestion: {...}, byDataSource: {...} }
router.get('/rooms/summary', async (req, res) => {
  try {
    const group = (field) => Room.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
    const [byBuildingRows, byCongestionRows, byDataSourceRows, byAvailableRows] = await Promise.all([
      group('inBuilding'),
      group('congestionIndex'),
      group('dataSource'),
      group('available'),
    ]);
    const toMap = (rows, fallback) => {
      const out = {};
      for (const r of rows) out[r._id ?? fallback] = r.count;
      return out;
    };
    const byAvailable = toMap(byAvailableRows, 'unknown');
    const total = byBuildingRows.reduce((sum, r) => sum + r.count, 0);
    res.json({
      total,
      available: byAvailable.true ?? 0,
      unavailable: byAvailable.false ?? 0,
      byBuilding: toMap(byBuildingRows, 'Unassigned'),
      byCongestion: toMap(byCongestionRows, 'unknown'),
      byDataSource: toMap(byDataSourceRows, 'unknown'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch room summary' });
  }
});

// GET /api/buildings/:id/rooms -> { building, rooms }  (rooms assigned to ONE building)
router.get('/buildings/:id/rooms', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid building id' });
    }
    const building = await Building.findById(req.params.id).lean();
    if (!building) return res.status(404).json({ error: 'Building not found' });
    const rooms = await Room.find({ inBuilding: building.buildName }).sort(ROOM_SORT).lean();
    res.json({ building, rooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch rooms for building' });
  }
});

module.exports = router;
