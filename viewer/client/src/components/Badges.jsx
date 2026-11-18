import { congestionLabel } from '../lib/congestion';
import './Badges.css';

// Small coloured pills shared by the Rooms and By Building pages.

export function StatusBadge({ available }) {
  const ok = available !== false; // missing field is treated as available
  return <span className={`badge ${ok ? 'badge-ok' : 'badge-off'}`}>{ok ? 'Available' : 'Unavailable'}</span>;
}

export function CongestionBadge({ index }) {
  return <span className={`badge badge-cong-${index ?? 'unknown'}`}>{congestionLabel(index)}</span>;
}
