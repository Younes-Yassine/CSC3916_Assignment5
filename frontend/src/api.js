import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL  // ← should be http://localhost:8080
});

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('jwt');
  if (token) cfg.headers.Authorization = token;
  return cfg;
});

export default client;
