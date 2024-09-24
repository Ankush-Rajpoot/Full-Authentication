import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL:  'http://localhost:5000/api/v1',
  withCredentials: true, // This ensures cookies (like tokens) are sent with requests
});

export default api;
