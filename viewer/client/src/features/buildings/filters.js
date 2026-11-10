// Filters available on the Buildings page. Each entry becomes a row of chips.
// Future filters (e.g. capacity, room style, availability) are added here.
export const buildingFilters = [
  {
    key: 'classification',
    label: 'Type',
    getValue: (b) => b.classification || 'Other',
  },
];
