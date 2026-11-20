# Seat Saver Database Viewer

A read-only feature for **viewing and filtering** the database. It is self-contained:
its own server, its own client, its own `package.json` files, and it does not import from
or modify the top-level `client/` and `server/` folders. Those stay free for **building and
modifying** the database (adding buildings, bookings, etc.).

|  | Database App (base server/client) | Viewer (this folder) |
|---|---|---|
| Purpose | create / modify data | view / filter data |
| Server | `server/`, port 5000 | `viewer/server`, port 5001 |
| Client | `client/`, port 5173 | `viewer/client`, port 5174 |
| DB user | writes (`MONGODB_URI`) | `readUser` only (`READ_MONGODB_URI`) |
| Can write? | yes | no |

Both can run at the same time.

## Setup and running (one terminal)

```bash
cd viewer
cp server/.env.example server/.env   # then fill in READ_MONGODB_URI (see the comments in the file)
npm run setup                        # installs server/ and client/ dependencies (once)
npm run dev                          # starts the viewer server AND client; Ctrl+C stops both
```

Then open http://localhost:5174. Output from each process is prefixed (`viewer-server |`,
`viewer-client |`). If one crashes, the other is stopped too.

To run the main app at the same time as the viewer, also from this one terminal:

```bash
npm run dev:all    # viewer server/client + the main app's ../server and ../client
```
## What's in it

```
viewer/
  package.json              `setup`, `dev`, `dev:all` scripts
  scripts/dev.js            one-terminal launcher (no dependencies)
  server/src/
    app.js                  Express app: GET-only guard (sign-in/out excepted), mounts /api
    index.js                loads .env, connects, checks both collections have data, listens
    config/db.js            connects with READ_MONGODB_URI only (no fallback to the write user)
    models/Building.js      read-side copy of the buildings schema (strict: false)
    models/Room.js          read-side copy of the rooms schema (strict: false)
    models/Booking.js       read-side description of the bookings collection (the shape to write)
    auth/provider.js        THE swap point for Pitt SSO: checks credentials (mock today)
    auth/mockUsers.js       demo Pitt accounts and their demo bookings
    auth/session.js         signed session cookie + requireAuth middleware
    bookings/               mock booking generator, booking -> room/building lookup
    routes/buildings.js     GET /api/buildings[?classification=], /api/filters, /api/summary
    routes/rooms.js         GET /api/rooms[?inBuilding=&available=&congestionIndex=&dataSource=],
                            /api/rooms/filters, /api/rooms/summary, /api/buildings/:id/rooms
    routes/assignments.js   GET /api/assignments  (every building with its rooms + unmatched rooms)
    routes/auth.js          POST /api/auth/login, /api/auth/logout; GET /api/auth/me, /api/auth/provider
    routes/bookings.js      GET /api/bookings  (signed-in student's bookings, with room and building)
  client/src/
    routes.jsx              PAGE REGISTRY: add one entry per new page
    features/buildings/     Buildings page: cards + type filter
    features/rooms/         Rooms page: all rooms, filter by building/status/congestion/source
    features/assignments/   Rooms by Building page: each building with the rooms assigned to it
    features/database/      Database page: sortable table / raw JSON, for buildings OR rooms
    features/auth/          sign-in page, AuthProvider/useAuth, RequireAuth, nav sign-in status
    features/bookings/      My Bookings page: the signed-in student's bookings, by day
    components/             FilterBar, FilterChips, StatusMessage, Badges, NavBar
    hooks/useApiGet.js      shared GET hook
    lib/filtering.js        generic applyFilters / countBy
    lib/congestion.js       congestionIndex 1/2/3 -> Low / Moderate / High
    services/api.js         axios instance (Vite proxies /api to port 5001)
```

## Pages

| Page | URL | What it shows |
|---|---|---|
| Buildings | `/` | Building cards, filtered by type |
| Rooms | `/rooms` | Every room on its own. Filter by building (dropdown), status, congestion and data source; search; sort. `?building=Hillman%20Library` pre-selects a building |
| Rooms by Building | `/by-building` | Every building as an expandable section listing the rooms assigned to it (count, available, total seats). Rooms whose `inBuilding` matches no building are listed at the bottom so typos are visible. `?building=` shows just one building |
| Database | `/database` | Raw table / JSON for the `buildings` **or** `rooms` collection (switch at the top) |
| My Bookings | `/bookings` | **Sign-in only.** The signed-in student's bookings, grouped by day: time, duration, room name and number, building (links to Rooms by Building), address, seats. Upcoming first (in-progress ones highlighted), past bookings folded away below |
| Sign in | `/sign-in` | Mock Pitt sign-in (not in the nav; signed-out visits to My Bookings land here and return afterwards) |

## How rooms and buildings relate

Both collections live in the same database, `test`: `test/buildings` and `test/rooms`.
A room belongs to a building **by name**: `room.inBuilding` must exactly equal
`building.buildName`. There is no ObjectId reference, so renaming a building without updating
its rooms leaves those rooms "unassigned" (the Rooms by Building page flags them).

`congestionIndex` is `1` (low), `2` (moderate) or `3` (high). `dataSource` marks whether a room
came from a Pitt source or is placeholder data.

The filter chips come from the values that exist in the database (`/api/filters`,
`/api/rooms/filters`), so there is no hard-coded type list to keep in sync with the main app's schema.

## Signing in (mock Pitt SSO)

The project doesn't have access to Pitt SSO yet, so sign-in is a **mock**: the server only
accepts the demo accounts in `server/src/auth/mockUsers.js`, and the sign-in page lists them.
Every demo account uses the password `password`.

| Username | Name | Demo bookings |
|---|---|---|
| `abc123` | Alex Carter | 4: one in progress now, two upcoming, one past |
| `def456` | Dana Fischer | 1 |
| `ghi789` | Gabe Ito | none (shows the empty state) |

Usernames can also be typed as `abc123@pitt.edu` or in capitals. Never type a real Pitt password
into the mock.

A successful sign-in sets an httpOnly cookie (`seatsaver_session`) holding a signed token, valid
for 8 hours. It is signed with `SESSION_SECRET` from `server/.env`; if that is empty a random
secret is made at start-up, which signs everyone out whenever the server restarts.

**Swapping in Pitt SSO** only means changing `server/src/auth/provider.js` (plus a callback
route). Pitt's sign-in page checks the password, so the mock password check goes away; whatever
reads Pitt's response just calls `setSessionCookie(res, { username, name, email })` like
`routes/auth.js` does now. The cookie, `/api/auth/me`, `/api/bookings`, `RequireAuth` and the
My Bookings page stay as they are.

## Bookings

`GET /api/bookings` returns only the signed-in student's bookings; there is no way to ask for
someone else's. It reads the `bookings` collection, which the main app will write once booking
exists (US1-US3). Please store bookings in this shape (documented in `server/src/models/Booking.js`):

| Field | Meaning |
|---|---|
| `user` | Pitt username of the student, e.g. `abc123` (what SSO will give us) |
| `room` | ObjectId of the booked document in `rooms` |
| `start`, `end` | Dates |
| `status` | `active` (default) or `cancelled`; cancelled bookings are not shown |

A booking points at its room by **ObjectId** (room names repeat across buildings), and the room
points at its building by name as before. A booking whose room was deleted still shows, marked
"Room not found".

Until then, the demo accounts also get **demo bookings** built from the real `rooms` collection
(marked `dataSource: "mock"` and shown with a "Demo booking" tag). The times are relative to today,
so the demo never goes stale. Real bookings for a demo username show up alongside them.

`BookingRow` has a `children` slot at the end of each row for the Edit / Cancel buttons.
