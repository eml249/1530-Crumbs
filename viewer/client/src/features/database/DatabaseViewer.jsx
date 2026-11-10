import { useMemo, useState } from 'react';
import useApiGet from '../../hooks/useApiGet';
import StatusMessage from '../../components/StatusMessage';
import './DatabaseViewer.css';

// Columns shown in table view. `key` matches the field names in server/src/models/Building.js.
const COLUMNS = [
  { key: 'buildName', label: 'Building Name' },
  { key: 'address', label: 'Address' },
  { key: 'classification', label: 'Classification' },
  { key: 'createdAt', label: 'Created At' },
  { key: '_id', label: '_id' },
  { key: '__v', label: '__v' },
];

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
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

// READ-ONLY page: only issues GET requests to /api/*.
export default function DatabaseViewer() {
  const { data, loading, error, reload } = useApiGet('/buildings');
  const { data: summary } = useApiGet('/summary');
  const rows = data ?? [];
  const [view, setView] = useState('table'); // 'table' | 'json'
  const [sort, setSort] = useState({ key: 'buildName', dir: 'asc' });

  const sorted = useMemo(() => {
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => factor * compare(a[sort.key], b[sort.key]));
  }, [rows, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  return (
    <div className="dbv">
      <header className="dbv-header">
        <div>
          <h1>Database Contents</h1>
          <p className="dbv-sub">
            Read-only view of the <code>buildings</code> collection
            {summary ? ` — ${summary.total} document${summary.total === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <div className="dbv-actions">
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
      </header>

      {summary && Object.keys(summary.byClassification).length > 0 && (
        <ul className="dbv-summary" aria-label="Documents per classification">
          {Object.entries(summary.byClassification)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, count]) => (
              <li key={name}>
                <strong>{count}</strong> {name}
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
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
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
                  {COLUMNS.map((c) => (
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
    </div>
  );
}
