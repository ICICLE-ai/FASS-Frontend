import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Stub a minimal localStorage BEFORE importing client.js so the module's
// initial token read doesn't blow up in the default node vitest env (there's
// no jsdom/happy-dom configured for this project).
function makeFakeLocalStorage() {
    const store = new Map();
    return {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => { store.set(k, String(v)); },
        removeItem: (k) => { store.delete(k); },
        clear: () => { store.clear(); },
    };
}
vi.stubGlobal('localStorage', makeFakeLocalStorage());

// Suppress the "VITE_API_BASE_URL is not set" console.error that client.js
// logs at import time -- tests don't exercise the real baseURL (the adapter
// is stubbed below) and we don't want unrelated noise in the test output.
vi.stubEnv('VITE_API_BASE_URL', 'http://test.invalid/api');

const { client, setAuthToken, clearAuthToken, getAuthToken } = await import('./client.js');

// Short-circuit real HTTP by swapping in an adapter that just echoes back
// the resolved config. Lets us assert on the headers the interceptor
// actually produced without hitting the network.
function captureNextRequest() {
    return new Promise((resolve) => {
        client.defaults.adapter = async (config) => {
            resolve(config);
            return {
                data: {},
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
                request: {},
            };
        };
    });
}

const originalAdapter = client.defaults.adapter;

beforeEach(() => {
    clearAuthToken();
});

afterEach(() => {
    clearAuthToken();
    client.defaults.adapter = originalAdapter;
});

describe('client Authorization interceptor', () => {
    it('omits the Authorization header when no token is set', async () => {
        const captured = captureNextRequest();
        await client.get('/anything');
        const config = await captured;
        const header = config.headers.get
            ? config.headers.get('Authorization')
            : config.headers.Authorization;
        expect(header).toBeFalsy();
    });

    it('attaches Authorization: Bearer <token> when a token is set', async () => {
        setAuthToken('abc.def.ghi');
        const captured = captureNextRequest();
        await client.get('/anything');
        const config = await captured;
        const header = config.headers.get
            ? config.headers.get('Authorization')
            : config.headers.Authorization;
        expect(header).toBe('Bearer abc.def.ghi');
    });

    it('drops the Authorization header after clearAuthToken (logout)', async () => {
        setAuthToken('tok');
        clearAuthToken();
        const captured = captureNextRequest();
        await client.get('/anything');
        const config = await captured;
        const header = config.headers.get
            ? config.headers.get('Authorization')
            : config.headers.Authorization;
        expect(header).toBeFalsy();
    });

    it('does not leak a stale header set on a per-call basis after logout', async () => {
        setAuthToken('tok');
        clearAuthToken();
        const captured = captureNextRequest();
        await client.get('/anything', { headers: { Authorization: 'Bearer stale' } });
        const config = await captured;
        const header = config.headers.get
            ? config.headers.get('Authorization')
            : config.headers.Authorization;
        // The interceptor should strip any Authorization when signed out, so
        // even an explicit per-call header gets removed. This matches the
        // backend contract: no header -> treated as the public pool.
        expect(header).toBeFalsy();
    });
});

describe('setAuthToken / clearAuthToken / getAuthToken', () => {
    it('getAuthToken returns null when nothing is set', () => {
        expect(getAuthToken()).toBeNull();
    });

    it('setAuthToken persists the token to localStorage', () => {
        setAuthToken('tok-123');
        expect(getAuthToken()).toBe('tok-123');
        expect(localStorage.getItem('feast:authToken')).toBe('tok-123');
    });

    it('clearAuthToken removes the token from memory and localStorage', () => {
        setAuthToken('tok-123');
        clearAuthToken();
        expect(getAuthToken()).toBeNull();
        expect(localStorage.getItem('feast:authToken')).toBeNull();
    });

    it('setAuthToken(null) is equivalent to clearAuthToken', () => {
        setAuthToken('tok');
        setAuthToken(null);
        expect(getAuthToken()).toBeNull();
        expect(localStorage.getItem('feast:authToken')).toBeNull();
    });

    it('setAuthToken("") does not persist an empty-string token', () => {
        setAuthToken('');
        expect(getAuthToken()).toBeNull();
        expect(localStorage.getItem('feast:authToken')).toBeNull();
    });
});
