import { useState, useEffect } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [buildingFilter, setBuildingFilter] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (buildingFilter.trim()) params.append('building', buildingFilter.trim());
        if (onlyAvailable) params.append('available', 'true');

        // Adjust base URL if you don't have a Vite proxy configured in vite.config.js
        const response = await fetch(`http://localhost:5000/api/rooms?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setRooms(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [buildingFilter, onlyAvailable]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Campus Rooms</h1>

      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filter by building name..."
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem', width: '260px' }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          Available only
        </label>
      </div>

      {/* Status Messages */}
      {loading && <p>Loading rooms...</p>}
      {error && <p style={{ color: 'red' }}>Error loading rooms: {error}</p>}

      {!loading && !error && rooms.length === 0 && (
        <p>No rooms found matching your filters.</p>
      )}

      {/* Rooms Table */}
      {!loading && !error && rooms.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '0.75rem' }}>Room Name</th>
              <th style={{ padding: '0.75rem' }}>Building</th>
              <th style={{ padding: '0.75rem' }}>Room #</th>
              <th style={{ padding: '0.75rem' }}>Capacity</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Congestion Index</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{room.roomName}</td>
                <td style={{ padding: '0.75rem' }}>{room.inBuilding}</td>
                <td style={{ padding: '0.75rem' }}>{room.roomNum}</td>
                <td style={{ padding: '0.75rem' }}>{room.capacity}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      backgroundColor: room.available ? '#d4edda' : '#f8d7da',
                      color: room.available ? '#155724' : '#721c24',
                    }}
                  >
                    {room.available ? 'Available' : 'Occupied'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>{room.congestionIndex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}