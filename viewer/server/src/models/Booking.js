const mongoose = require('mongoose');

// Read-side description of the `bookings` collection. The viewer never writes it:
// creating, cancelling and editing bookings (US1-US3) belong to the main server,
// which has the write user. This is the shape the My Bookings page reads, so
// please store bookings like this:
//
//   user     Pitt username of the student who booked, e.g. "abc123"
//            (the same id Pitt SSO will give us, and what the session holds)
//   room     ObjectId of the booked document in `rooms`
//   start    Date the booking starts
//   end      Date the booking ends
//   status   'active' (default) or 'cancelled'; cancelled bookings are not shown
//
// `strict: false` lets fields the main app adds later come through untouched.
const bookingSchema = new mongoose.Schema(
  {
    user: String,
    room: mongoose.Schema.Types.ObjectId,
    start: Date,
    end: Date,
    status: String,
    createdAt: Date,
  },
  { strict: false, collection: 'bookings' },
);

module.exports = mongoose.model('Booking', bookingSchema);
