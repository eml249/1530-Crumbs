import { useMemo, useState } from 'react';
import useApiGet from '../../hooks/useApiGet';
import StatusMessage from '../../components/StatusMessage';
import { congestionLabel } from '../../lib/congestion';
import './DatabaseViewer.css';

// One entry per collection the viewer can show. To show another collection, add an entry
// here (plus the matching GET routes on the viewer server).
//   columns   : `key` matches the field name in the document
//   summary() : turns the server's /summary response into [label, count] pills
const COLLECTIONS = {
  buildings: {
    label: 'Buildings',
    path: '/buildings',
    summaryPath: '/summary',
    defaultSort: 'buildName',
    columns: [
      { key: 'buildName', label: 'Building Name' },
      { key: 'address', label: 'Address' },
      { key: 'classification', label: 'Classification' },
      { key: 'createdAt', label: 'Created At' },
      { key: '_id', label: '_id' },
      { key: '__v', label: '__v' },
    ],
    summary: (s) => Object.entries(s.byClassification ?? {}).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => [name, count]),
  },
  rooms: {
    label: 'Rooms',
    path: '/rooms',
    summaryPath: '/rooms/summary',
    defaultSort: 'inBuilding',
    columns: [
      { key: 'roomName', label: 'Room Name' },
      { key: 'inBuilding', label: 'In Building' },
      { key: 'roomNum', label: 'Room #' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'available', label: 'Available' },
      { key: 'congestionIndex', label: 'Congestion' },
      { key: 'dataSource', label: 'Data Source' },
      { key: 'createdAt', label: 'Created At' },
      { key: '_id', label: '_id' },
      { key: '__v', label: '__v' },
    ],
    summary: (s) => [
      ['available', s.available],
      ['unavailable', s.unavailable],
      ...Object.entries(s.byCongestion ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, count]) => [`congestion ${k} (${congestionLabel(Number(k))})`, count]),
    ],
  },
};

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function formatCell(key, value) {
  if (value === undefined || value === null) return '—';
  if (key === 'createdAt') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }
  return String(value);
}

// Keyed by collection in the parent, so switching collections starts with fresh sort/view state.
function CollectionTable({ name }) {
  const config = COLLECTIONS[name];
  const { data, loading, error, reload } = useApiGet(config.path);
  const { data: summary } = useApiGet(config.summaryPath);
  const rows = data ?? [];
  const [view, setView] = useState('table'); // 'table' | 'json'
  const [sort, setSort] = useState({ key: config.defaultSort, dir: 'asc' });

  const sorted = useMemo(() => {
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...(data ?? [])].sort((a, b) => factor * compare(a[sort.key], b[sort.key]));
  }, [data, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const pills = summary ? config.summary(summary) : [];

  return (
    <>
      <p className="dbv-sub dbv-count">
        Read-only view of the <code>{name}</code> collection
        {summary ? ` — ${summary.total} document${summary.total === 1 ? '' : 's'}` : ''}
      </p>

      <div className="dbv-actions dbv-bar">
        <div className="dbv-toggle" role="group" aria-label="View mode">
          <button type="button" className={view === 'table' ? 'active' : ''} aria-pressed={view === 'table'} onClick={() => setView('table')}>
            Table
          </button>
          <button type="button" className={view === 'json' ? 'active' : ''} aria-pressed={view === 'json'} onClick={() => setView('json')}>
            Raw JSON
          </button>
        </div>
        <button type="button" className="dbv-refresh" onClick={reload} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {pills.length > 0 && (
        <ul className="dbv-summary" aria-label={`Summary of ${name}`}>
          {pills.map(([label, count]) => (
            <li key={label}>
              <strong>{count}</strong> {label}
            </li>
          ))}
        </ul>
      )}

      <StatusMessage
        loading={loading && !data}
        error={error && !data}
        onRetry={reload}
        empty={!loading && !error && rows.length === 0}
        emptyText="The collection is empty."
      />

      {rows.length > 0 && view === 'table' && (
        <div className="dbv-scroll">
          <table className="dbv-table">
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c.key} aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button type="button" onClick={() => toggleSort(c.key)}>
                      {c.label}
                      <span className="dbv-arrow" aria-hidden="true">
                        {sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row._id}>
                  {config.columns.map((c) => (
                    <td key={c.key} className={c.key === '_id' ? 'dbv-mono' : undefined}>
                      {formatCell(c.key, row[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && view === 'json' && <pre className="dbv-json">{JSON.stringify(sorted, null, 2)}</pre>}
    </>
  );
}

// READ-ONLY page: only issues GET requests to /api/*.
export default function DatabaseViewer() {
  const [collection, setCollection] = useState('buildings');

  return (
    <div className="dbv">
      <header className="dbv-header">
        <div>
          <h1>Database Contents</h1>
          <div className="dbv-toggle dbv-collections" role="group" aria-label="Collection">
            {Object.entries(COLLECTIONS).map(([key, c]) => (
              <button key={key} type="button" className={collection === key ? 'active' : ''} aria-pressed={collection === key} onClick={() => setCollection(key)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <CollectionTable key={collection} name={collection} />
    </div>
  );
}
