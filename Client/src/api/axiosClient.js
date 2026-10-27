import axios from 'axios';

// Create configured Axios instance
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token from localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Could handle 401 Unauthorized globally here
    return Promise.reject(error);
  }
);

export default axiosClient;
