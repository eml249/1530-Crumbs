const express = require('express');
const Building = require('../models/Building');
const Room = require('../models/Room');

const router = express.Router();

// GET /api/assignments
// -> {
//      buildings: [{ ...building, rooms: [...] }],   every building, with the rooms assigned to it
//      unassigned: [...]                             rooms whose `inBuilding` matches no building
//    }
//
// Rooms are tied to buildings by name (room.inBuilding === building.buildName), so
// this is the one place that "join" lives. `unassigned` exists to make typos or
// renamed buildings visible instead of silently dropping those rooms.
router.get('/assignments', async (req, res) => {
  try {
    const [buildings, rooms] = await Promise.all([
      Building.find().sort({ buildName: 1 }).lean(),
      Room.find().sort({ inBuilding: 1, roomNum: 1, roomName: 1 }).lean(),
    ]);

    const byName = new Map(buildings.map((b) => [b.buildName, { ...b, rooms: [] }]));
    const unassigned = [];
    for (const room of rooms) {
      const target = byName.get(room.inBuilding);
      if (target) target.rooms.push(room);
      else unassigned.push(room);
    }

    res.json({ buildings: [...byName.values()], unassigned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch building/room assignments' });
  }
});

module.exports = router;
