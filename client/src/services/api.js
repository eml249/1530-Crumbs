import axios from 'axios';

// Create an axios instance pointing to your backend URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches your Express backend port
});

export default API;