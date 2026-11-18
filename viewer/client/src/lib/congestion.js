// congestionIndex is stored as an integer: 1 = low, 2 = moderate, 3 = high.
// Keep the wording in one place so every page labels it the same way.
export const CONGESTION_LABELS = { 1: 'Low', 2: 'Moderate', 3: 'High' };

export function congestionLabel(index) {
  return CONGESTION_LABELS[index] ?? 'Unknown';
}
