// Shared loading / error / empty messaging so every page behaves the same way.
export default function StatusMessage({ loading, error, empty, emptyText, onRetry }) {
  if (error) {
    return (
      <p role="alert" style={{ color: '#b00020' }}>
        Could not load data. Is the server running?{' '}
        {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
      </p>
    );
  }
  if (loading) return <p style={{ color: '#555' }}>Loading…</p>;
  if (empty) return <p style={{ color: '#555' }}>{emptyText}</p>;
  return null;
}
