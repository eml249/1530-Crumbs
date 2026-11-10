import { ALL } from '../lib/filtering';
import './FilterChips.css';

/**
 * One row of single-select chips ("All" + options) with counts.
 * options: [{ value, count }]
 */
export default function FilterChips({ label, options, total, value, onChange }) {
  const current = value ?? ALL;
  return (
    <div className="fc-group" role="group" aria-label={`Filter by ${label}`}>
      <span className="fc-label">{label}</span>
      <button
        type="button"
        className={`fc-chip ${current === ALL ? 'active' : ''}`}
        aria-pressed={current === ALL}
        onClick={() => onChange(ALL)}
      >
        All <span className="fc-count">{total}</span>
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`fc-chip ${current === o.value ? 'active' : ''}`}
          aria-pressed={current === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.value} <span className="fc-count">{o.count}</span>
        </button>
      ))}
    </div>
  );
}
