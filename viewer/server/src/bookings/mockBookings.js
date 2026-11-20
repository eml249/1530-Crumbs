// Demo bookings for the MOCK accounts in auth/mockUsers.js. They are built on
// every request from the real `rooms` collection and come out in the same shape
// as a stored booking, so the room/building lookup in bookingViews.js runs on them
// exactly as it will on real bookings. Each one is marked dataSource: 'mock'.
//
// The same account always gets the same rooms (as long as the rooms don't
// change), and the times are relative to today, so the demo never goes stale.

const MINUTE = 60 * 1000;

// Small deterministic hash + PRNG, so room picks are stable per username.
function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(items, seed) {
  const random = seededRandom(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// { day, at, minutes } -> start Date (server's local time)
function slotStart({ day = 0, at }, now) {
  const start = new Date(now);
  start.setDate(start.getDate() + day);
  if (at === 'now') {
    start.setMinutes(start.getMinutes() < 30 ? 0 : 30, 0, 0);
  } else {
    const [hours, minutes] = String(at).split(':').map(Number);
    start.setHours(hours, minutes || 0, 0, 0);
  }
  return start;
}

// account:        an entry from auth/mockUsers.js
// rooms:          documents from the rooms collection
// buildingNames:  Set of building names, so rooms that belong to a known building are preferred
function buildMockBookings(account, rooms, buildingNames = new Set(), now = new Date()) {
  const slots = account?.bookings ?? [];
  if (slots.length === 0) return [];

  const placed = rooms.filter((r) => buildingNames.has(r.inBuilding));
  const candidates = (placed.length > 0 ? placed : rooms)
    .slice()
    .sort((a, b) => String(a._id).localeCompare(String(b._id)));
  const pool = shuffled(candidates, hashString(account.username));

  return slots.map((slot, i) => {
    const room = pool.length > 0 ? pool[i % pool.length] : null;
    const start = slotStart(slot, now);
    return {
      _id: `mock-${account.username}-${i + 1}`,
      user: account.username,
      room: room ? room._id : null,
      start,
      end: new Date(start.getTime() + slot.minutes * MINUTE),
      status: 'active',
      dataSource: 'mock',
    };
  });
}

module.exports = { buildMockBookings, slotStart };
