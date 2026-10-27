import axios from 'axios'

// Backend contract (ICICLE-ai/Food-Access-Model#102): no Authorization header
// -> shared public pool (NULL owner_id); Authorization: Bearer <token> -> only
// that user's instances. The token is verified server-side via JWKS (Tapis
// JWKS for this deployment); a token that fails verification is treated as
// no token, which keeps the request on the public pool rather than 500ing.
const AUTH_TOKEN_STORAGE_KEY = 'feast:authToken';

function readPersistedToken() {
    try {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || null;
    } catch {
        return null;
    }
}

let authToken = readPersistedToken();

export function setAuthToken(token) {
    authToken = token || null;
    try {
        if (typeof localStorage === 'undefined') return;
        if (authToken) {
            localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
        } else {
            localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        }
    } catch {
        // ignore storage errors (private browsing, disabled storage, etc.)
    }
}

export function clearAuthToken() {
    setAuthToken(null);
}

export function getAuthToken() {
    return authToken;
}

if (!import.meta.env.VITE_API_BASE_URL) {
    console.error('VITE_API_BASE_URL is not set. Check that the correct .env file exists for this Vite mode.');
}

export const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

client.interceptors.request.use((config) => {
    if (!config.headers) {
        config.headers = {};
    }
    if (authToken) {
        if (typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${authToken}`);
        } else {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
    } else {
        // Make sure a stale header from a prior signed-in state doesn't
        // leak out after logout.
        if (typeof config.headers.delete === 'function') {
            config.headers.delete('Authorization');
        } else {
            delete config.headers.Authorization;
        }
    }
    return config;
});
