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
export default api;
