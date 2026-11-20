import { useEffect, useState } from 'react';
import API from '../../services/api'; // ADJUST: use the same axios instance that useApiGet uses
import { formatTimeRange, dayHeading } from './format';

export default function CancelBookingButton({ booking: b, now, onCancelled }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Escape closes the dialog (unless a request is in flight)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && !busy && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy]);

  async function confirmCancel() {
    setBusy(true);
    setError('');
    try {
      await API.delete(`/bookings/${encodeURIComponent(b._id)}`);
      setOpen(false);
      onCancelled(b._id);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not cancel this booking. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const { title, date } = dayHeading(b.start, now);
  const roomLabel = b.room ? `${b.room.roomName}, ${b.building.name}` : 'this booking';

  return (
    <div className="bk-actions">
      <button type="button" className="bk-cancel-btn" onClick={() => setOpen(true)}>
        Cancel booking
      </button>

      {open && (
        <div className="bk-modal-backdrop" onClick={() => !busy && setOpen(false)}>
          <div
            className="bk-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bk-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="bk-modal-title">Cancel this booking?</h3>
            <p className="bk-modal-summary">
              <strong>{roomLabel}</strong>
              <br />
              {title} {date}, {formatTimeRange(b.start, b.end)}
            </p>
            <p className="bk-modal-warn">This can&apos;t be undone.</p>
            {error && <p className="bk-modal-error" role="alert">{error}</p>}
            <div className="bk-modal-buttons">
              <button type="button" onClick={() => setOpen(false)} disabled={busy} autoFocus>
                Keep booking
              </button>
              <button type="button" className="bk-danger" onClick={confirmCancel} disabled={busy}>
                {busy ? 'Cancelling...' : 'Yes, cancel it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}