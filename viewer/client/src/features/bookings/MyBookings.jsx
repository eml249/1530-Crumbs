import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useApiGet from '../../hooks/useApiGet';
import StatusMessage from '../../components/StatusMessage';
import { useAuth } from '../auth/AuthContext';
import BookingRow from './BookingRow';
import { dayHeading, dayKey, hasEnded } from './format';
import './MyBookings.css';
import CancelBookingButton from './CancelBookingButton';

// US5: a signed-in student sees the room (building, room number, address) and
// the time of each of their bookings, grouped by day. Sign-in only: routes.jsx
// wraps this page in <RequireAuth>.

function groupByDay(bookings) {
  const groups = new Map();
  for (const b of bookings) {
    const key = dayKey(b.start);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }
  return [...groups.values()];
}

function DayGroup({ bookings, now, onCancelled }) {
  const { title, date } = dayHeading(bookings[0].start, now);
  return (
    <section className="bk-day">
      <h3>
        {title} <span className="bk-date">{date}</span>
      </h3>
      <ul className="bk-list">
        {bookings.map((b) => (
          <BookingRow key={b._id} booking={b} now={now}>
            {onCancelled && <CancelBookingButton booking={b} now={now} onCancelled={onCancelled} />}
          </BookingRow>
        ))}
      </ul>
    </section>
  );
}

export default function MyBookings() {
  const { user, refresh } = useAuth();
  const { data, loading, error, reload } = useApiGet('/bookings');
  const sessionEnded = error?.response?.status === 401;

  // The session ran out while the page was open: re-check, which sends the
  // student back to the sign-in page.
  useEffect(() => {
    if (sessionEnded) refresh();
  }, [sessionEnded, refresh]);

  const { now, upcoming, past } = useMemo(() => {
    const at = Date.now();
    const all = data ?? [];
    return {
      now: at,
      upcoming: all.filter((b) => !hasEnded(b, at)),
      past: all.filter((b) => hasEnded(b, at)).reverse(), // most recent first
    };
  }, [data]);

  const hasAny = upcoming.length + past.length > 0;

  return (
    <div className="bk">
      <header className="bk-header">
        <h1>My Bookings</h1>
        {user && (
          <p className="bk-sub">
            Signed in as {user.name} ({user.username})
          </p>
        )}
      </header>

      <StatusMessage
        loading={loading && !data}
        error={error && !data && !sessionEnded}
        onRetry={reload}
      />

      {data && !hasAny && (
        <div className="bk-empty">
          <p>You have no study room bookings.</p>
          <Link to="/rooms">Browse study rooms</Link>
        </div>
      )}

      {hasAny && (
        <section aria-labelledby="bk-upcoming-title">
          <h2 id="bk-upcoming-title">
            Upcoming <span className="bk-count">{upcoming.length}</span>
          </h2>
          {upcoming.length === 0 ? (
            <p className="bk-none">
              Nothing coming up. <Link to="/rooms">Browse study rooms</Link>
            </p>
          ) : (
            groupByDay(upcoming).map((group) => <DayGroup key={dayKey(group[0].start)} bookings={group} now={now} onCancelled={reload} />)
          )}
        </section>
      )}

      {past.length > 0 && (
        <details className="bk-past">
          <summary>
            Past bookings <span className="bk-count">{past.length}</span>
          </summary>
          {groupByDay(past).map((group) => (
            <DayGroup key={dayKey(group[0].start)} bookings={group} now={now} />
          ))}
        </details>
      )}
    </div>
  );
}
