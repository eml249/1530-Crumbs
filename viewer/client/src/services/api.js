import axios from 'axios';

// Relative base URL: in development Vite proxies /api to the viewer server
// (see vite.config.js), so no host/port is hard-coded here.
const API = axios.create({ baseURL: '/api' });

export default API;
