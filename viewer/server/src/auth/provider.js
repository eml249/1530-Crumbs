const crypto = require('crypto');
const mockUsers = require('./mockUsers');

// THE place to swap in Pitt SSO. Everything else (the session cookie,
// /api/auth/me, /api/bookings, the client) only ever sees the
// { username, name, email } object that verifyCredentials() returns.
//
// Today this is a MOCK: it checks the username and password against
// auth/mockUsers.js. Pitt sign-in is single sign-on, so with real access the
// password check goes away: /api/auth/login would redirect to Pitt's sign-in
// page, Pitt would send the student back to a callback route with a signed
// response, and that callback would read the student's Pitt username from it and
// call setSessionCookie() exactly like routes/auth.js does now.

const name = 'mock';

// Accepts "abc123", " ABC123 " or "abc123@pitt.edu".
function normalizeUsername(raw) {
  return String(raw).trim().toLowerCase().replace(/@pitt\.edu$/, '');
}

// Compares hashes so the check takes the same time however close the guess is.
function sameText(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function findMockAccount(username) {
  return mockUsers.accounts.find((a) => a.username === username) ?? null;
}

// -> { username, name, email } if the credentials are right, otherwise null
async function verifyCredentials(username, password) {
  const account = findMockAccount(normalizeUsername(username));
  const passwordOk = sameText(password, mockUsers.password);
  if (!account || !passwordOk) return null;
  return { username: account.username, name: account.name, email: `${account.username}@pitt.edu` };
}

// What the sign-in page needs to know. For the mock that's the demo accounts, so
// teammates and graders can sign in without asking anyone. A real SSO provider
// would return something like { provider: 'pitt-sso', loginUrl } instead.
function describe() {
  return {
    provider: name,
    demoPassword: mockUsers.password,
    demoAccounts: mockUsers.accounts.map((a) => ({ username: a.username, name: a.name, bookings: a.bookings.length })),
  };
}

module.exports = { name, normalizeUsername, verifyCredentials, findMockAccount, describe };
