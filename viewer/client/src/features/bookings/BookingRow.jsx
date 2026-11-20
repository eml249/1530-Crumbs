import { Link } from 'react-router-dom';
import { formatDuration, formatTimeRange, isInProgress } from './format';

// One booking: when it is, and where. `children` renders at the end of the row:
// the slot for the Edit / Cancel buttons from US1-US3.
export default function BookingRow({ booking: b, now, children }) {
  const live = isInProgress(b, now);
  const duration = formatDuration(b.start, b.end);

  return (
    <li className={`bk-row${live ? ' bk-row-live' : ''}`}>
      <div className="bk-when">
        <span className="bk-time">{formatTimeRange(b.start, b.end)}</span>
        {duration && <span className="bk-duration">{duration}</span>}
        {live && <span className="bk-live">In progress</span>}
      </div>

      <div className="bk-where">
        {b.room ? (
          <>
            <h4 className="bk-room">{b.room.roomName}</h4>
            <p className="bk-place">
              {b.room.roomNum != null && <span>Room {b.room.roomNum}, </span>}
              <Link to={`/by-building?building=${encodeURIComponent(b.building.name)}`}>{b.building.name}</Link>
            </p>
            <p className="bk-detail">{b.building.address ?? 'Address not listed'}</p>
            {b.room.capacity != null && <p className="bk-detail">Seats {b.room.capacity}</p>}
          </>
        ) : (
          <>
            <h4 className="bk-room">Room not found</h4>
            <p className="bk-detail">This room is no longer in the database. Check with the building, or book another room.</p>
          </>
        )}
        {b.dataSource === 'mock' && <span className="bk-tag">Demo booking</span>}
      </div>

      {children}
    </li>
  );
}
