import FilterChips from './FilterChips';
import { countBy } from '../lib/filtering';

/**
 * Renders one FilterChips row per filter definition. Adding a new filter to a
 * page is just adding a definition (see features/buildings/filters.js).
 *
 * serverOptions (optional): { [filterKey]: string[] } of every allowed value,
 * e.g. from the model's enum, so chips with zero matches are still shown.
 */
export default function FilterBar({ definitions, items, selected, onChange, serverOptions = {} }) {
  return (
    <div className="fb">
      {definitions.map((def) => {
        const counts = countBy(items, def.getValue);
        const values = [...new Set([...(serverOptions[def.key] || []), ...Object.keys(counts)])];
        return (
          <FilterChips
            key={def.key}
            label={def.label}
            total={items.length}
            options={values.map((value) => ({ value, count: counts[value] || 0 }))}
            value={selected[def.key]}
            onChange={(v) => onChange({ ...selected, [def.key]: v })}
          />
        );
      })}
    </div>
  );
}
