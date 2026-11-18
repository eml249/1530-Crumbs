// Filters available on the Buildings page. Each entry becomes a row of chips.
// Room filters live in features/rooms/filters.js.
export const buildingFilters = [
  {
    key: 'classification',
    label: 'Type',
    getValue: (b) => b.classification || 'Other',
  },
];
