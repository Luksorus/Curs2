import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});


api.interceptors.response.use(
  (response) => response,
  (error) => {

    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 