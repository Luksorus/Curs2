import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002', // Порт API сервера
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Добавляем для работы с куками
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Более подробное логирование ошибок
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

// Перехватчик для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Если отправляем FormData, удаляем Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Логируем запрос для отладки
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