import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useApiGet from '../../hooks/useApiGet';
import { ALL, applyFilters } from '../../lib/filtering';
import FilterBar from '../../components/FilterBar';
import StatusMessage from '../../components/StatusMessage';
import RoomCard from './RoomCard';
import { buildingFilter, fixedChipOptions, roomFilters } from './filters';
import './RoomBrowser.css';

const SORTS = {
  building: { label: 'Building, then room #', compare: (a, b) => (a.inBuilding || '').localeCompare(b.inBuilding || '') || (a.roomNum ?? 0) - (b.roomNum ?? 0) || (a.roomName || '').localeCompare(b.roomName || '') },
  capacity: { label: 'Capacity (largest first)', compare: (a, b) => (b.capacity ?? 0) - (a.capacity ?? 0) },
  congestion: { label: 'Congestion (lowest first)', compare: (a, b) => (a.congestionIndex ?? 99) - (b.congestionIndex ?? 99) },
  name: { label: 'Room name', compare: (a, b) => (a.roomName || '').localeCompare(b.roomName || '', undefined, { numeric: true }) },
};

// READ-ONLY page: every room, on its own, independent of buildings.
// The building dropdown is kept in the URL (?building=Hillman%20Library) so the
// By Building page can link straight to a filtered list.
export default function RoomBrowser() {
  const { data, loading, error, reload } = useApiGet('/rooms');
  const { data: serverOptions } = useApiGet('/rooms/filters');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState({}); // chip filters
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('building');

  const building = searchParams.get('building') || ALL;
  const rooms = useMemo(() => data ?? [], [data]);

  const buildingNames = useMemo(() => {
    const names = new Set(serverOptions?.inBuilding ?? rooms.map((r) => r.inBuilding).filter(Boolean));
    if (building !== ALL) names.add(building); // keep a linked-to building selectable even if it has no rooms
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [serverOptions, rooms, building]);

  const chipOptions = { ...fixedChipOptions, dataSource: serverOptions?.dataSource ?? [] };

  const setBuilding = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === ALL) next.delete('building');
    else next.set('building', value);
    setSearchParams(next, { replace: true });
  };

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return applyFilters(rooms, { ...selected, inBuilding: building }, [...roomFilters, buildingFilter])
      .filter((r) => !text || `${r.roomName} ${r.inBuilding} ${r.roomNum}`.toLowerCase().includes(text))
      .sort(SORTS[sortKey].compare);
  }, [rooms, selected, building, query, sortKey]);

  return (
    <div className="rb">
      <header className="rb-header">
        <h1>Study Rooms</h1>
        <p className="rb-sub">
          Showing {visible.length} of {rooms.length} room{rooms.length === 1 ? '' : 's'}
          {building !== ALL && <> in <strong>{building}</strong></>}
        </p>
      </header>

      <div className="rb-controls">
        <label>
          Building
          <select value={building} onChange={(e) => setBuilding(e.target.value)}>
            <option value={ALL}>All buildings</option>
            {buildingNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input type="search" placeholder="Room name or number" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          Sort by
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <FilterBar definitions={roomFilters} items={rooms} selected={selected} onChange={setSelected} serverOptions={chipOptions} />

      <StatusMessage
        loading={loading && !data}
        error={error && !data}
        onRetry={reload}
        empty={!loading && !error && visible.length === 0}
        emptyText={rooms.length === 0 ? 'No rooms in the database yet.' : 'No rooms match these filters.'}
      />

      <ul className="rb-grid">
        {visible.map((r) => (
          <RoomCard key={r._id} room={r} />
        ))}
      </ul>
    </div>
  );
}
