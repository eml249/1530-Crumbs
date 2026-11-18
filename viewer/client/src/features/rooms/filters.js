import { congestionLabel } from '../../lib/congestion';

// Chip filters available on the Rooms page. Each entry becomes a row of chips.
export const roomFilters = [
  {
    key: 'available',
    label: 'Status',
    getValue: (r) => (r.available === false ? 'Unavailable' : 'Available'),
  },
  {
    key: 'congestionIndex',
    label: 'Congestion',
    getValue: (r) => congestionLabel(r.congestionIndex),
  },
  {
    key: 'dataSource',
    label: 'Source',
    getValue: (r) => r.dataSource || 'unknown',
  },
];

// The building filter is a dropdown (there are too many buildings for chips),
// but it uses the same definition shape so applyFilters can handle it.
export const buildingFilter = {
  key: 'inBuilding',
  label: 'Building',
  getValue: (r) => r.inBuilding,
};

// Chips that should always appear, even when nothing currently matches them.
export const fixedChipOptions = {
  available: ['Available', 'Unavailable'],
  congestionIndex: ['Low', 'Moderate', 'High'],
};
