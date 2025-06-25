import axios from 'axios';
import config from './config.json';
import { getAccessToken, handleTokenRefresh, tokenExpired } from './utils/Library';

const api = axios.create({
  baseURL: config.ROOT_URL,
});

api.interceptors.request.use(
  async (config) => {
    let token = await getAccessToken();
    if (tokenExpired(token)) {
      token = await handleTokenRefresh();
    }
    // Always set the Authorization header if a token exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// debugging to find all 401 errors
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const { method, url } = error.config;
      console.log(`[401] ${method.toUpperCase()} ${url}`);

      console.log('    WWW-Authenticate:', error.response.headers['www-authenticate'] ?? '-');
    }

    if (url.includes('/Patient/ValidateUser')) {
      console.log('→ mock 200 /ValidateUser');
      return Promise.resolve({ status: 200, data: { userID: 1, patientID: 2 } });
    }
    
    if (url.includes('/Patient/SaveEULA')) {
      console.log('→ mock 200 /SaveEULA');
      return Promise.resolve({ status: 200, data: {} });
    }    

    return Promise.reject(error);
  }
);

export default api;


