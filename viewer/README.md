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
    app.js                  Express app: GET-only guard, mounts /api
    index.js                loads .env, connects, listens
    config/db.js            connects with READ_MONGODB_URI only (no fallback to the write user)
    models/Building.js      read-side copy of the schema (strict: false, so new fields still show)
    routes/buildings.js     GET /api/buildings[?classification=], /api/filters, /api/summary
  client/src/
    routes.jsx              PAGE REGISTRY: add one entry per new page
    features/buildings/     Buildings page: cards + type filter
    features/database/      Database page: sortable table / raw JSON
    components/             FilterBar, FilterChips, StatusMessage, NavBar
    hooks/useApiGet.js      shared GET hook
    lib/filtering.js        generic applyFilters / countBy
    services/api.js         axios instance (Vite proxies /api to port 5001)
```

The filter chips come from the values that exist in the database (`/api/filters`), so there
is no hard-coded type list to keep in sync with the main app's schema.

