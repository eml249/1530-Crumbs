const express = require('express');
const cors = require('cors');
const buildingsRouter = require('./routes/buildings');
const assignmentsRouter = require('./routes/assignments');
const roomsRouter = require('./routes/rooms');

const app = express();
app.use(cors());

// This whole server is read-only: reject anything that isn't a read.
app.use((req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return res.status(405).set('Allow', 'GET, HEAD, OPTIONS').json({ error: 'Read-only server' });
  }
  next();
});
app.use('/api/rooms', roomsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', buildingsRouter);
app.use('/api', roomsRouter);
app.use('/api', assignmentsRouter);

module.exports = app;
