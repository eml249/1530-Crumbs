const crypto = require('crypto');

// Who is signed in, kept in an httpOnly cookie. No database and no extra
// dependencies: the cookie holds `<payload>.<signature>`, where the signature is
// an HMAC of the payload with SESSION_SECRET, so the browser can't change whose
// session it is.
//
// None of this changes when the mock sign-in is replaced by Pitt SSO. SSO only
// changes how we find out *who* the student is (see auth/provider.js); after
// that the server still calls setSessionCookie() with the same user object.

const COOKIE_NAME = 'seatsaver_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

let secret;
function getSecret() {
  if (!secret) {
    secret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
    if (!process.env.SESSION_SECRET) {
      console.warn('SESSION_SECRET is not set, so a random one is used: everyone is signed out when the server restarts.');
    }
  }
  return secret;
}

function sign(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

// user: { username, name, email } -> token string
function createSessionToken(user, now = Date.now()) {
  const payload = { sub: user.username, name: user.name, email: user.email, exp: now + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

// token string -> { username, name, email }, or null if it is missing, edited or expired
function readSessionToken(token, now = Date.now()) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || payload.exp <= now) {
    return null;
  }
  return { username: payload.sub, name: payload.name, email: payload.email };
}

// Reads one cookie from the request (saves adding cookie-parser for a single value).
function getCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1 || part.slice(0, eq).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function cookieOptions() {
  return {
    httpOnly: true, // page JavaScript can't read the cookie
    sameSite: 'lax', // the browser won't send it on cross-site POSTs
    secure: process.env.NODE_ENV === 'production', // HTTPS-only once deployed
    path: '/',
  };
}

function setSessionCookie(res, user) {
  res.cookie(COOKIE_NAME, createSessionToken(user), { ...cookieOptions(), maxAge: SESSION_TTL_MS });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

// Middleware for routes that need a signed-in student: sets req.user, or answers 401.
function requireAuth(req, res, next) {
  const user = readSessionToken(getCookie(req, COOKIE_NAME));
  if (!user) return res.status(401).json({ error: 'Sign in to continue.' });
  req.user = user;
  next();
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_MS,
  createSessionToken,
  readSessionToken,
  getCookie,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
};
