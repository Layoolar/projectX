import axios from 'axios';
import queryString from 'query-string';
import { BASE_URL } from './endpoints';
import { deleteCookie, getCookie } from 'cookies-next';
import { COOKIES } from './constants';

const DEFAULT_REQUEST_TIMEOUT = 15000; // 15 seconds
const DEFAULT_GET_REQUEST_TIMEOUT = 8000; // 8 seconds
// axios instance
export const _axios = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_REQUEST_TIMEOUT,
  paramsSerializer,
  // withCredentials: true,
});

_axios.interceptors.request.use(
  async (config) => {
    const token = getCookie(COOKIES.auth_Token);
    if (token && !config?.url.includes('auth'))
      config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

_axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      //logout the user
      deleteCookie(COOKIES.auth_Token);
      if (window.location !== undefined) {
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

function paramsSerializer(params) {
  return queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
    strict: true,
    arrayFormat: 'comma',
  });
}
