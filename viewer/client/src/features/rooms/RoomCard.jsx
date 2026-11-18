import { Link } from 'react-router-dom';
import { CongestionBadge, StatusBadge } from '../../components/Badges';

// `children` renders at the bottom of the card, the slot for later features
// (reserve button, favorite, ...).
export default function RoomCard({ room: r, children }) {
  return (
    <li className="rb-card">
      <div className="rb-card-top">
        <h2>{r.roomName}</h2>
        <StatusBadge available={r.available} />
      </div>
      <p className="rb-building">
        {r.inBuilding ? (
          <Link to={`/by-building?building=${encodeURIComponent(r.inBuilding)}`} title="See this building and all of its rooms">
            {r.inBuilding}
          </Link>
        ) : (
          'No building'
        )}
      </p>
      <dl>
        <dt>Room #</dt>
        <dd>{r.roomNum ?? '—'}</dd>
        <dt>Capacity</dt>
        <dd>{r.capacity ?? '—'}</dd>
        <dt>Congestion</dt>
        <dd>
          <CongestionBadge index={r.congestionIndex} />
        </dd>
        <dt>Source</dt>
        <dd className="rb-muted">{r.dataSource || '—'}</dd>
      </dl>
      {children}
    </li>
  );
}
