require('dotenv').config();
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-only-secret';

const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const app = require('./app');
const mockUsers = require('./auth/mockUsers');
const { buildMockBookings, slotStart } = require('./bookings/mockBookings');
const { toBookingViews } = require('./bookings/bookingViews');

const rooms = [
  { _id: 'r1', roomName: 'Study Room A', inBuilding: 'Hillman Library', roomNum: 101, capacity: 4 },
  { _id: 'r2', roomName: 'Study Room B', inBuilding: 'Hillman Library', roomNum: 102, capacity: 6 },
  { _id: 'r3', roomName: 'Group Room', inBuilding: 'Sennott Square', roomNum: 5500, capacity: 10 },
  { _id: 'r4', roomName: 'Lost Room', inBuilding: 'Typo Hall', roomNum: 1, capacity: 2 },
];
const buildings = [
  { buildName: 'Hillman Library', address: '3960 Forbes Ave', classification: 'Library' },
  { buildName: 'Sennott Square', address: '210 S Bouquet St', classification: 'Academic' },
];
const buildingNames = new Set(buildings.map((b) => b.buildName));
const account = mockUsers.accounts.find((a) => a.bookings.length >= 3);

describe('mock bookings', () => {
  const now = new Date(2026, 10, 19, 13, 47); // Thu 19 Nov 2026, 1:47 PM

  it('turns { day, at } into a start time', () => {
    assert.deepStrictEqual(slotStart({ day: 1, at: '10:00' }, now), new Date(2026, 10, 20, 10, 0));
    assert.deepStrictEqual(slotStart({ day: -3, at: '16:30' }, now), new Date(2026, 10, 16, 16, 30));
    assert.deepStrictEqual(slotStart({ day: 0, at: 'now' }, now), new Date(2026, 10, 19, 13, 30));
  });

  it('gives each slot a room from a known building, with an end after its start', () => {
    const list = buildMockBookings(account, rooms, buildingNames, now);
    assert.strictEqual(list.length, account.bookings.length);
    for (const b of list) {
      assert.ok(['r1', 'r2', 'r3'].includes(b.room), `picked ${b.room}, which has no known building`);
      assert.ok(b.end > b.start);
      assert.strictEqual(b.dataSource, 'mock');
      assert.strictEqual(b.user, account.username);
    }
    // Different rooms while there are enough to go round.
    const firstThree = list.slice(0, 3).map((b) => b.room);
    assert.strictEqual(new Set(firstThree).size, 3);
  });

  it('is stable for the same account and rooms, whatever order the rooms come in', () => {
    const a = buildMockBookings(account, rooms, buildingNames, now).map((b) => b.room);
    const b = buildMockBookings(account, [...rooms].reverse(), buildingNames, now).map((x) => x.room);
    assert.deepStrictEqual(a, b);
  });

  it('copes with no rooms and with accounts that have no bookings', () => {
    const list = buildMockBookings(account, [], buildingNames, now);
    assert.strictEqual(list.length, account.bookings.length);
    assert.ok(list.every((b) => b.room === null));
    assert.deepStrictEqual(buildMockBookings({ username: 'x', bookings: [] }, rooms, buildingNames, now), []);
  });
});

describe('booking views', () => {
  const bookings = [
    { _id: 'b2', room: 'r3', start: new Date('2026-11-21T14:00:00Z'), end: new Date('2026-11-21T15:00:00Z') },
    { _id: 'b1', room: 'r1', start: new Date('2026-11-20T10:00:00Z'), end: new Date('2026-11-20T12:00:00Z'), dataSource: 'mock' },
    { _id: 'b3', room: 'gone', start: new Date('2026-11-22T09:00:00Z'), end: new Date('2026-11-22T10:00:00Z') },
    { _id: 'b4', room: 'r4', start: new Date('2026-11-23T09:00:00Z'), end: new Date('2026-11-23T10:00:00Z') },
  ];
  const views = toBookingViews(bookings, rooms, buildings);

  it('sorts soonest first', () => {
    assert.deepStrictEqual(views.map((v) => v._id), ['b1', 'b2', 'b3', 'b4']);
  });

  it('attaches the room and its building', () => {
    assert.deepStrictEqual(views[0].room, { _id: 'r1', roomName: 'Study Room A', roomNum: 101, capacity: 4 });
    assert.deepStrictEqual(views[0].building, { name: 'Hillman Library', address: '3960 Forbes Ave', classification: 'Library' });
    assert.strictEqual(views[0].status, 'active');
    assert.strictEqual(views[0].dataSource, 'mock');
  });

  it('marks a missing room, and a room whose building is missing', () => {
    assert.strictEqual(views[2].room, null);
    assert.strictEqual(views[2].building, null);
    assert.strictEqual(views[3].building.name, 'Typo Hall');
    assert.strictEqual(views[3].building.address, null);
  });
});

describe('GET /api/bookings (database)', () => {
  let server;

  it('returns the signed-in demo student\'s bookings with their rooms', async () => {
    const uri = process.env.READ_MONGODB_URI;
    assert.ok(uri, 'Database URI is missing from server/.env');
    await mongoose.connect(uri);

    await new Promise((resolve) => {
      server = app.listen(0, resolve);
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: account.username, password: mockUsers.password }),
    });
    assert.strictEqual(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];

    const res = await fetch(`${baseUrl}/api/bookings`, { headers: { Cookie: cookie } });
    assert.strictEqual(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list), 'Expected GET /api/bookings to return a JSON array');

    const mock = list.filter((b) => b.dataSource === 'mock');
    assert.strictEqual(mock.length, account.bookings.length);
    for (const b of mock) {
      assert.ok(b.start && b.end, 'every booking has a time');
      if (b.room) assert.ok(b.building && b.building.name, 'every booking with a room has a building name');
    }
  });

  after(async () => {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
});
