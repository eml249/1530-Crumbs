function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// `children` renders at the bottom of the card: the slot where later features
// (congestion level, favorite button, available rooms) can attach.
export default function BuildingCard({ building: b, children }) {
  const type = b.classification || 'Other';
  return (
    <li className="bb-card">
      <div className="bb-card-top">
        <h2>{b.buildName}</h2>
        <span className={`bb-badge type-${type.toLowerCase().replace(/\s+/g, '-')}`}>{type}</span>
      </div>
      <dl>
        <dt>Address</dt>
        <dd>{b.address || '—'}</dd>
        <dt>Added</dt>
        <dd>{formatDate(b.createdAt)}</dd>
        <dt>ID</dt>
        <dd className="bb-id">{b._id}</dd>
      </dl>
      {children}
    </li>
  );
}
