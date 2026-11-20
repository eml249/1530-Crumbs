const express = require('express');
const provider = require('../auth/provider');
const { setSessionCookie, clearSessionCookie, requireAuth } = require('../auth/session');

const router = express.Router();

// Mounted at /api/auth. Login and logout are the only non-GET requests the viewer
// accepts (see the guard in app.js); they set or clear a cookie and never touch
// the database.

// GET /api/auth/provider -> what the sign-in page should show (mock: the demo accounts)
router.get('/provider', (req, res) => res.json(provider.describe()));

// POST /api/auth/login { username, password } -> { user } and a session cookie
router.post('/login', express.json({ limit: '2kb' }), async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
    return res.status(400).json({ error: 'Enter your Pitt username and password.' });
  }
  try {
    const user = await provider.verifyCredentials(username, password);
    if (!user) return res.status(401).json({ error: 'That username and password do not match.' });
    setSessionCookie(res, user);
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sign-in failed' });
  }
});

// POST /api/auth/logout -> 204, cookie cleared
router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

// GET /api/auth/me -> { user } for the signed-in student, or 401
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;
