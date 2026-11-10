// Generic, data-agnostic filtering helpers. Buildings use them today; rooms
// (US4, US10) can reuse them by supplying their own filter definitions.
//
// A filter definition looks like:
//   { key: 'classification', label: 'Type', getValue: (item) => item.classification || 'Other' }

export const ALL = 'All';

export function applyFilters(items, selected, definitions) {
  return items.filter((item) =>
    definitions.every((def) => {
      const choice = selected[def.key];
      return choice === undefined || choice === ALL || def.getValue(item) === choice;
    }),
  );
}

export function countBy(items, getValue) {
  const counts = {};
  for (const item of items) {
    const v = getValue(item);
    counts[v] = (counts[v] || 0) + 1;
  }
  return counts;
}
