const express = require('express');
const cors = require('cors');
const buildingsRouter = require('./routes/buildings');
const assignmentsRouter = require('./routes/assignments');
const roomsRouter = require('./routes/rooms');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');

const app = express();
app.use(cors());

// This whole server is read-only: reject anything that isn't a read. The one
// exception is signing in and out, which only sets or clears a cookie and never
// touches the database (the database user is read-only anyway).
const ALLOWED_NON_READS = new Set(['POST /api/auth/login', 'POST /api/auth/logout']);
app.use((req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !ALLOWED_NON_READS.has(`${req.method} ${req.path}`)) {
    return res.status(405).set('Allow', 'GET, HEAD, OPTIONS').json({ error: 'Read-only server' });
  }
  next();
});
app.use('/api/rooms', roomsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api', bookingsRouter);
app.use('/api', buildingsRouter);
app.use('/api', roomsRouter);
app.use('/api', assignmentsRouter);

module.exports = app;
