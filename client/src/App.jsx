import { useState, useEffect } from 'react';
import API from './services/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 1. LOAD data when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  // 2. SAVE data when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/posts', { title, content });
      setPosts([...posts, response.data]); // Add the new post to the local state list immediately
      setTitle(''); // Clear form inputs
      setContent('');
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Buildings Available</h2>

      {/* Form to Save Data */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <input 
            type="text" 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <textarea 
            placeholder="Content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Save to Database</button>
      </form>

      {/* List to Load/Display Data */}
      <h3>Loaded Buildings:</h3>
      <ul>
        {posts.map((post) => (
          <li key={post._id} style={{ marginBottom: '10px' }}>
            <strong>{post.title}</strong>: {post.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;