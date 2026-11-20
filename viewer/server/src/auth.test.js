// Mock sign-in tests. None of these touch the database, so they run without a
// READ_MONGODB_URI.
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-only-secret';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('./app');
const session = require('./auth/session');
const provider = require('./auth/provider');
const mockUsers = require('./auth/mockUsers');

const demo = mockUsers.accounts[0];
const user = { username: demo.username, name: demo.name, email: `${demo.username}@pitt.edu` };

describe('session tokens', () => {
  it('round-trips the user', () => {
    const token = session.createSessionToken(user);
    assert.deepStrictEqual(session.readSessionToken(token), user);
  });

  it('rejects a token whose payload was edited', () => {
    const [, signature] = session.createSessionToken(user).split('.');
    const forged = Buffer.from(JSON.stringify({ sub: 'someone-else', exp: Date.now() + 60000 })).toString('base64url');
    assert.strictEqual(session.readSessionToken(`${forged}.${signature}`), null);
  });

  it('rejects an expired token', () => {
    const issued = Date.now() - session.SESSION_TTL_MS - 1000;
    assert.strictEqual(session.readSessionToken(session.createSessionToken(user, issued)), null);
  });

  it('rejects garbage', () => {
    for (const bad of [undefined, '', 'abc', 'a.b.c', '.', 'x.y']) {
      assert.strictEqual(session.readSessionToken(bad), null, `accepted ${JSON.stringify(bad)}`);
    }
  });

  it('reads one cookie out of a Cookie header', () => {
    const req = { headers: { cookie: `other=1; ${session.COOKIE_NAME}=abc.def; last=2` } };
    assert.strictEqual(session.getCookie(req, session.COOKIE_NAME), 'abc.def');
    assert.strictEqual(session.getCookie({ headers: {} }, session.COOKIE_NAME), undefined);
  });
});

describe('mock provider', () => {
  it('accepts a demo account, also typed as an email or in capitals', async () => {
    for (const typed of [demo.username, ` ${demo.username.toUpperCase()} `, `${demo.username}@pitt.edu`]) {
      assert.deepStrictEqual(await provider.verifyCredentials(typed, mockUsers.password), user);
    }
  });

  it('rejects a wrong password or unknown user', async () => {
    assert.strictEqual(await provider.verifyCredentials(demo.username, 'wrong'), null);
    assert.strictEqual(await provider.verifyCredentials('nobody1', mockUsers.password), null);
  });
});

describe('sign-in API', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(() => server && server.close());

  const login = (body) =>
    fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const sessionCookieFrom = (response) => {
    const header = response.headers.get('set-cookie') || '';
    const match = header.match(new RegExp(`${session.COOKIE_NAME}=([^;]+)`));
    return match ? `${session.COOKIE_NAME}=${match[1]}` : null;
  };

  it('lists the demo accounts for the sign-in page', async () => {
    const res = await fetch(`${baseUrl}/api/auth/provider`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.provider, 'mock');
    assert.ok(body.demoAccounts.some((a) => a.username === demo.username));
  });

  it('rejects missing fields with 400 and bad credentials with 401', async () => {
    assert.strictEqual((await login({ username: demo.username })).status, 400);
    const bad = await login({ username: demo.username, password: 'wrong' });
    assert.strictEqual(bad.status, 401);
    assert.strictEqual(sessionCookieFrom(bad), null);
  });

  it('signs in, reports who is signed in, and signs out', async () => {
    const res = await login({ username: demo.username, password: mockUsers.password });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual((await res.json()).user, user);

    const cookie = sessionCookieFrom(res);
    assert.ok(cookie, 'expected a session cookie');
    assert.match(res.headers.get('set-cookie'), /HttpOnly/i);

    const me = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
    assert.strictEqual(me.status, 200);
    assert.deepStrictEqual((await me.json()).user, user);

    const out = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie } });
    assert.strictEqual(out.status, 204);
    assert.match(out.headers.get('set-cookie') || '', new RegExp(`${session.COOKIE_NAME}=;`));
  });

  it('answers 401 for /me and /bookings without a valid cookie', async () => {
    assert.strictEqual((await fetch(`${baseUrl}/api/auth/me`)).status, 401);
    assert.strictEqual((await fetch(`${baseUrl}/api/bookings`)).status, 401);
    const forged = { headers: { Cookie: `${session.COOKIE_NAME}=not.valid` } };
    assert.strictEqual((await fetch(`${baseUrl}/api/bookings`, forged)).status, 401);
  });

  it('still rejects every other write', async () => {
    assert.strictEqual((await fetch(`${baseUrl}/api/rooms`, { method: 'POST' })).status, 405);
    assert.strictEqual((await fetch(`${baseUrl}/api/bookings`, { method: 'DELETE' })).status, 405);
    assert.strictEqual((await fetch(`${baseUrl}/api/auth/me`, { method: 'POST' })).status, 405);
  });
});
