const mongoose = require('mongoose');

// Read-side description of the `rooms` collection (test/rooms), which sits next
// to `buildings` in the same database. Like the Building copy, this is only
// used for reading: no `required`/`enum` rules, and `strict: false` so fields
// the main app adds later still come through to the viewer.
//
// A room belongs to a building by NAME: room.inBuilding === building.buildName.
const roomSchema = new mongoose.Schema(
  {
    roomName: String,
    inBuilding: String,
    roomNum: Number,
    capacity: Number,
    available: Boolean,
    congestionIndex: Number,
    dataSource: String,
    createdAt: Date,
  },
  { strict: false, collection: 'rooms' },
);

module.exports = mongoose.model('Room', roomSchema);
