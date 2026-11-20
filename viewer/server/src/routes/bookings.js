const express = require('express');
const Booking = require('../models/Booking');
const Building = require('../models/Building');
const Room = require('../models/Room');
const { requireAuth } = require('../auth/session');
const { findMockAccount } = require('../auth/provider');
const { buildMockBookings } = require('../bookings/mockBookings');
const { toBookingViews } = require('../bookings/bookingViews');

const router = express.Router();

// GET /api/bookings -> the signed-in student's bookings, soonest first, each with
// its room and building (shape documented in bookings/bookingViews.js).
//
// Only ever returns the bookings of the student in the session cookie; there is
// deliberately no ?user= parameter.
//
// Stored bookings come from the `bookings` collection. Mock accounts also get
// demo bookings (dataSource: 'mock'), so the page has something to show before
// the main app can create bookings.
router.get('/bookings', requireAuth, async (req, res) => {
  try {
    const { username } = req.user;
    const [stored, rooms, buildings] = await Promise.all([
      Booking.find({ user: username, status: { $ne: 'cancelled' } }).lean(),
      Room.find().lean(),
      Building.find().lean(),
    ]);

    const account = findMockAccount(username);
    const mock = account ? buildMockBookings(account, rooms, new Set(buildings.map((b) => b.buildName))) : [];

    res.json(toBookingViews([...stored, ...mock], rooms, buildings));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
