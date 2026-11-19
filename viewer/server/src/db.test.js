require('dotenv').config();
const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const app = require('./app');
const Room = require('./models/Room');

describe('Database & Read-Only API Integration', () => {
  let server;
  let baseUrl;

  it('should connect to MongoDB successfully', async () => {
    const uri = process.env.READ_MONGODB_URI;
    assert.ok(uri, 'Database URI is missing from server/.env');

    await mongoose.connect(uri);
    // readyState === 1 means connected
    assert.strictEqual(mongoose.connection.readyState, 1);
  });

  it('should query the rooms collection without errors', async () => {
    const rooms = await Room.find({}).limit(5);
    assert.ok(Array.isArray(rooms), 'Expected Room.find() to return an array');
  });

  it('should respond with 200 OK and JSON array from GET /api/rooms', async () => {
    // Boot Express on an ephemeral port (0) just for the test
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    const response = await fetch(`${baseUrl}/api/rooms`);
    assert.strictEqual(response.status, 200);

    const data = await response.json();
    assert.ok(Array.isArray(data), 'Expected GET /api/rooms to return a JSON array');
  });

  // Clean up so the test process exits immediately instead of hanging
  after(async () => {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
});