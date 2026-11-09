import { useState, useEffect } from 'react';
import axios from 'axios';

// Create an Axios instance pointing to your backend API
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function App() {
  const [buildings, setBuildings] = useState([]);
  const [buildName, setBuildName] = useState('');
  const [address, setAddress] = useState('');
  const [classification, setClassification] = useState('Academic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. LOAD buildings when the component mounts
  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await API.get('/buildings');
      setBuildings(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      setError('Failed to load buildings from server.');
      setLoading(false);
    }
  };

  // 2. SAVE a new building when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/buildings', {
        buildName,
        address,
        classification,
      });

      // Append the newly saved building to our local state list instantly
      setBuildings([...buildings, response.data]);

      // Reset form inputs
      setBuildName('');
      setAddress('');
      setClassification('Academic');
    } catch (err) {
      console.error('Error saving building:', err);
      alert('Failed to save building.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>Campus Building Directory</h1>

      {/* Form to Add a Building */}
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Add New Building</h3>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Building Name:</label>
          <input
            type="text"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Classification:</label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="Academic">Academic</option>
            <option value="Dining">Dining</option>
            <option value="Residence Hall">Residence Hall</option>
            <option value="Library">Library</option>
            <option value="Administrative">Administrative</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          Save to Database
        </button>
      </form>

      {/* Display List of Buildings */}
      <h3>Loaded Buildings ({buildings.length}):</h3>
      {loading && <p>Loading buildings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && buildings.length === 0 && (
        <p>No buildings saved in the database yet. Add one above!</p>
      )}

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {buildings.map((b) => (
          <li key={b._id} style={{ background: '#fff', border: '1px solid #ddd', padding: '12px', marginBottom: '10px', borderRadius: '6px' }}>
            <strong>{b.buildName}</strong> ({b.classification})<br />
            <span style={{ color: '#666', fontSize: '14px' }}>{b.address}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;