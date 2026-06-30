import axios from 'axios';

// In production (Vercel), point to Render backend
// In development, Vite proxy handles /api -> localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
});

export default api;
