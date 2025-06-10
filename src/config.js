
const API_BASE_URL = '';

export const config = {
  apiUrl: API_BASE_URL,
  imageUrl: 'http://localhost:3002', 
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
    },
    tours: {
      list: '/api/tours',
      create: '/api/tours',
      update: (id) => `/api/tours/${id}`,
      delete: (id) => `/api/tours/${id}`,
      guideTours: '/api/tours/guide-tours',
      guides: '/api/tours/guides'
    }
  }
};

export const getImageUrl = (path) => {
  if (!path) return '';
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.imageUrl}/${cleanPath}`;
};

export default config; 