import { store } from '../store/store';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    // Get token from Redux state
    const token = store.getState().auth.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    if (config.headers.Authorization) {
        console.log('[API Request] Authorization header present');
    } else {
        console.warn('[API Request] Authorization header MISSING');
    }
    return config;
});

export default api;
