import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useApiGet from '../../hooks/useApiGet';
import { applyFilters } from '../../lib/filtering';
import FilterBar from '../../components/FilterBar';
import StatusMessage from '../../components/StatusMessage';
import { CongestionBadge, StatusBadge } from '../../components/Badges';
import { buildingFilters } from '../buildings/filters';
import './BuildingRooms.css';

function RoomTable({ rooms }) {
  return (
    <div className="br-scroll">
      <table className="br-table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Room #</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Congestion</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r._id}>
              <td>{r.roomName}</td>
              <td>{r.roomNum ?? '—'}</td>
              <td>{r.capacity ?? '—'}</td>
              <td>
                <StatusBadge available={r.available} />
              </td>
              <td>
                <CongestionBadge index={r.congestionIndex} />
              </td>
              <td className="br-muted">{r.dataSource || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BuildingSection({ building: b, open, onToggle }) {
  const availableCount = b.rooms.filter((r) => r.available !== false).length;
  const seats = b.rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const type = b.classification || 'Other';
  return (
    <details className="br-building" open={open} onToggle={(e) => onToggle(b.buildName, e.currentTarget.open)}>
      <summary>
        <span className="br-name">{b.buildName}</span>
        <span className={`br-type type-${type.toLowerCase().replace(/\s+/g, '-')}`}>{type}</span>
        <span className="br-counts">
          {b.rooms.length === 0
            ? 'No rooms'
            : `${b.rooms.length} room${b.rooms.length === 1 ? '' : 's'} · ${availableCount} available · ${seats} seats`}
        </span>
      </summary>
      <div className="br-body">
        <p className="br-address">
          {b.address || 'No address'}
          {b.rooms.length > 0 && (
            <>
              {' · '}
              <Link to={`/rooms?building=${encodeURIComponent(b.buildName)}`}>View in Rooms</Link>
            </>
          )}
        </p>
        {b.rooms.length > 0 ? <RoomTable rooms={b.rooms} /> : <p className="br-muted">No rooms are assigned to this building yet.</p>}
      </div>
    </details>
  );
}

// READ-ONLY page: every building with the rooms assigned to it. A room is
// assigned to a building when room.inBuilding equals building.buildName.
export default function BuildingRooms() {
  const { data, loading, error, reload } = useApiGet('/assignments');
  const { data: serverOptions } = useApiGet('/filters');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState({}); // { classification: 'Library' }
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [openState, setOpenState] = useState({}); // buildName -> boolean (user's choice)

  const only = searchParams.get('building'); // set by links from the Rooms page
  const buildings = useMemo(() => data?.buildings ?? [], [data]);
  const unassigned = data?.unassigned ?? [];

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return applyFilters(buildings, selected, buildingFilters).filter((b) => {
      if (only && b.buildName !== only) return false;
      if (hideEmpty && b.rooms.length === 0) return false;
      if (!text) return true;
      return (
        b.buildName.toLowerCase().includes(text) ||
        b.rooms.some((r) => `${r.roomName} ${r.roomNum}`.toLowerCase().includes(text))
      );
    });
  }, [buildings, selected, query, hideEmpty, only]);

  // A building is open if the user opened it, or if it's the one linked to via ?building=
  const isOpen = (b) => openState[b.buildName] ?? (only === b.buildName);
  const setAll = (value) => setOpenState(Object.fromEntries(visible.map((b) => [b.buildName, value])));
  const onToggle = (name, value) => setOpenState((s) => (s[name] === value ? s : { ...s, [name]: value }));

  const withRooms = buildings.filter((b) => b.rooms.length > 0).length;
  const totalRooms = buildings.reduce((n, b) => n + b.rooms.length, 0);

  return (
    <div className="br">
      <header className="br-header">
        <h1>Rooms by Building</h1>
        <p className="br-sub">
          {buildings.length} building{buildings.length === 1 ? '' : 's'}, {withRooms} with rooms, {totalRooms} room
          {totalRooms === 1 ? '' : 's'} assigned
        </p>
      </header>

      {only && (
        <p className="br-only">
          Showing only <strong>{only}</strong>{' '}
          <button type="button" onClick={() => setSearchParams({}, { replace: true })}>
            Show all buildings
          </button>
        </p>
      )}

      <FilterBar definitions={buildingFilters} items={buildings} selected={selected} onChange={setSelected} serverOptions={serverOptions ?? {}} />

      <div className="br-controls">
        <input type="search" placeholder="Search buildings or rooms" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search buildings or rooms" />
        <label className="br-check">
          <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} /> Hide buildings with no rooms
        </label>
        <span className="br-spacer" />
        <button type="button" onClick={() => setAll(true)}>Expand all</button>
        <button type="button" onClick={() => setAll(false)}>Collapse all</button>
      </div>

      <StatusMessage
        loading={loading && !data}
        error={error && !data}
        onRetry={reload}
        empty={!loading && !error && visible.length === 0}
        emptyText={buildings.length === 0 ? 'No buildings in the database yet.' : 'No buildings match these filters.'}
      />

      <div className="br-list">
        {visible.map((b) => (
          <BuildingSection key={b._id} building={b} open={isOpen(b)} onToggle={onToggle} />
        ))}
      </div>

      {unassigned.length > 0 && !only && (
        <section className="br-unassigned">
          <h2>Rooms not matching any building ({unassigned.length})</h2>
          <p className="br-muted">
            These rooms' <code>inBuilding</code> doesn't exactly match any building's <code>buildName</code>
            (usually a typo or a renamed building).
          </p>
          <div className="br-scroll">
            <table className="br-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>inBuilding</th>
                  <th>Room #</th>
                  <th>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {unassigned.map((r) => (
                  <tr key={r._id}>
                    <td>{r.roomName}</td>
                    <td>{r.inBuilding || '—'}</td>
                    <td>{r.roomNum ?? '—'}</td>
                    <td>{r.capacity ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
