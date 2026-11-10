const mongoose = require('mongoose');

// Read-side description of the `buildings` collection, which the main server
// (../../server/src/models/Building.js) owns and writes to. This copy is only
// used for reading, so it has no `required`/`enum` rules, and `strict: false`
// means fields the main app adds later still come through to the viewer.
const buildingSchema = new mongoose.Schema(
  {
    buildName: String,
    address: String,
    classification: String,
    createdAt: Date,
  },
  { strict: false, collection: 'buildings' },
);

module.exports = mongoose.model('Building', buildingSchema);
