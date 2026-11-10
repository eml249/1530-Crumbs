import { useMemo, useState } from 'react';
import useApiGet from '../../hooks/useApiGet';
import { applyFilters } from '../../lib/filtering';
import FilterBar from '../../components/FilterBar';
import StatusMessage from '../../components/StatusMessage';
import BuildingCard from './BuildingCard';
import { buildingFilters } from './filters';
import './BuildingBrowser.css';

// READ-ONLY page: lists buildings and filters them. Only issues GET requests.
export default function BuildingBrowser() {
  const { data, loading, error, reload } = useApiGet('/buildings');
  const { data: serverOptions } = useApiGet('/filters'); // allowed values, from the model enum
  const [selected, setSelected] = useState({}); // { classification: 'Library', ... }

  const buildings = data ?? [];
  const visible = useMemo(
    () =>
      applyFilters(buildings, selected, buildingFilters).sort((a, b) =>
        (a.buildName || '').localeCompare(b.buildName || ''),
      ),
    [buildings, selected],
  );

  return (
    <div className="bb">
      <header className="bb-header">
        <h1>Campus Building Directory</h1>
        <p className="bb-sub">
          Showing {visible.length} of {buildings.length} building{buildings.length === 1 ? '' : 's'}
        </p>
      </header>

      <FilterBar
        definitions={buildingFilters}
        items={buildings}
        selected={selected}
        onChange={setSelected}
        serverOptions={serverOptions ?? {}}
      />

      <StatusMessage
        loading={loading && !data}
        error={error && !data}
        onRetry={reload}
        empty={!loading && !error && visible.length === 0}
        emptyText={buildings.length === 0 ? 'No buildings in the database yet.' : 'No buildings match these filters.'}
      />

      <ul className="bb-grid">
        {visible.map((b) => (
          <BuildingCard key={b._id} building={b} />
        ))}
      </ul>
    </div>
  );
}
