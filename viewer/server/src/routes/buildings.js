const express = require('express');
const Building = require('../models/Building');

const router = express.Router();

// Query-string filters /buildings accepts. To make another field filterable
// (later: capacity, room style, ...), add one entry here.
const FILTERABLE = ['classification'];

// GET /api/buildings                          -> every building document
// GET /api/buildings?classification=Library   -> only that type
router.get('/buildings', async (req, res) => {
  try {
    const filter = {};
    for (const field of FILTERABLE) {
      const value = req.query[field];
      if (value === undefined) continue;
      if (typeof value !== 'string') {
        return res.status(400).json({ error: `${field} must be a string` });
      }
      filter[field] = value;
    }
    const buildings = await Building.find(filter).sort({ buildName: 1 }).lean();
    res.json(buildings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

// GET /api/filters -> { classification: ['Academic', 'Library', ...] }
// The values that actually exist in the database, so the UI has no hard-coded list.
router.get('/filters', async (req, res) => {
  try {
    const options = {};
    for (const field of FILTERABLE) {
      const values = await Building.distinct(field);
      options[field] = values.filter((v) => typeof v === 'string' && v).sort();
    }
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// GET /api/summary -> { total, byClassification: { Academic: 3, ... } }
router.get('/summary', async (req, res) => {
  try {
    const rows = await Building.aggregate([{ $group: { _id: '$classification', count: { $sum: 1 } } }]);
    const byClassification = {};
    let total = 0;
    for (const r of rows) {
      byClassification[r._id ?? 'Unclassified'] = r.count;
      total += r.count;
    }
    res.json({ total, byClassification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
