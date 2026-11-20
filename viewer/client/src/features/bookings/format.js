// Date and time wording for bookings, shown in the browser's time zone.

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

function toDate(value) {
  if (value == null) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Groups bookings by the local day they start on: 'YYYY-MM-DD', or 'none'.
export function dayKey(value) {
  const d = toDate(value);
  if (!d) return 'none';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// -> { title: 'Today' | 'Tomorrow' | 'Yesterday' | 'Monday', date: 'November 19' }
export function dayHeading(value, now = Date.now()) {
  const d = toDate(value);
  if (!d) return { title: 'No date set', date: '' };
  const days = Math.round((startOfDay(d) - startOfDay(now)) / DAY);
  const names = { 0: 'Today', 1: 'Tomorrow', [-1]: 'Yesterday' };
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  return {
    title: names[days] ?? d.toLocaleDateString(undefined, { weekday: 'long' }),
    date: d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) }),
  };
}

// '1:30 – 3:00 PM'
export function formatTimeRange(startValue, endValue) {
  const start = toDate(startValue);
  const end = toDate(endValue);
  if (!start) return 'Time not set';
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  if (!end || end <= start) return time.format(start);
  if (dayKey(start) !== dayKey(end)) {
    const full = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    return full.formatRange(start, end);
  }
  return time.formatRange(start, end);
}

// '2 hr', '1 hr 30 min', '45 min'
export function formatDuration(startValue, endValue) {
  const start = toDate(startValue);
  const end = toDate(endValue);
  if (!start || !end) return '';
  const minutes = Math.round((end - start) / MINUTE);
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 && `${h} hr`, m > 0 && `${m} min`].filter(Boolean).join(' ');
}

// A booking counts as past once it has ended; one with no end is past once it has started.
export function hasEnded(booking, now = Date.now()) {
  const end = toDate(booking.end) ?? toDate(booking.start);
  return end ? end.getTime() <= now : false;
}

export function isInProgress(booking, now = Date.now()) {
  const start = toDate(booking.start);
  return Boolean(start) && start.getTime() <= now && !hasEnded(booking, now);
}
