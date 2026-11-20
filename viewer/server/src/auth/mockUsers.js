// MOCK Pitt accounts, used in place of Pitt SSO until the project has access to it.
// These are the only accounts the mock sign-in accepts, so nobody should ever type
// a real Pitt password into it.
//
// `bookings` lists each account's demo bookings relative to today, so the demo
// never goes stale:
//   { day: 1, at: '10:00', minutes: 120 }   tomorrow, 10:00 AM to 12:00 PM
//   { day: -3, at: '16:00', minutes: 60 }   three days ago (shows under "Past")
//   { day: 0, at: 'now', minutes: 90 }      started at the last half hour (shows "In progress")
// The rooms are picked from the real `rooms` collection; see bookings/mockBookings.js.

const password = 'password';

const accounts = [
  {
    username: 'abc123',
    name: 'Alex Carter',
    bookings: [
      { day: 0, at: 'now', minutes: 90 },
      { day: 1, at: '10:00', minutes: 120 },
      { day: 4, at: '14:30', minutes: 60 },
      { day: -3, at: '16:00', minutes: 120 },
    ],
  },
  {
    username: 'def456',
    name: 'Dana Fischer',
    bookings: [{ day: 2, at: '09:00', minutes: 180 }],
  },
  {
    // No bookings: shows the page's empty state.
    username: 'ghi789',
    name: 'Gabe Ito',
    bookings: [],
  },
];

module.exports = { password, accounts };
