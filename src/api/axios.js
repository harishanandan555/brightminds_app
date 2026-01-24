import axios from 'axios';

let store;

export const injectStore = (_store) => {
    store = _store;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);

    // Get token from Redux state if store is available
    if (store) {
        const state = store.getState();
        const token = state.auth.token;
        console.log('[API Interceptor] Auth State:', {
            isAuthenticated: state.auth.isAuthenticated,
            hasToken: !!token
        });

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    if (config.headers.Authorization) {
        console.log('[API Request] Authorization header present');
    } else {
        console.warn('[API Request] Authorization header MISSING');
    }
    return config;
});

// Response interceptor to handle 401s globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[API] 401 Unauthorized detected. Logging out...');
            // Dispatch logout action via injected store
            if (store) {
                store.dispatch({ type: 'auth/logout' });
            }

            // Optional: Redirect to login if not handled by state change
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
