import { describe, it, expect, beforeEach, vi } from 'vitest';

// Same setup as client.test.js (node env, no jsdom): stub localStorage before
// client.js reads it at import time, and set the API base URL so client.js
// doesn't log about it.
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
vi.stubEnv('VITE_API_BASE_URL', 'http://test.invalid/api');

const { initialToken } = await import('./AuthContext.jsx');
const { getAuthToken, setAuthToken, clearAuthToken } = await import('./client.js');

// Minimal document stub, same approach as tapisSession.test.js.
function setCookie(cookie) {
    vi.stubGlobal('document', { cookie });
}

beforeEach(() => {
    clearAuthToken();
});

describe('initialToken', () => {
    it('uses the X-Tapis-Token cookie and saves it', () => {
        setCookie('X-Tapis-Token=abc.def.ghi');
        expect(initialToken()).toBe('abc.def.ghi');
        expect(getAuthToken()).toBe('abc.def.ghi');
        expect(localStorage.getItem('feast:authToken')).toBe('abc.def.ghi');
    });

    it('does not reuse a saved token once the cookie is gone (signed out of Tapis)', () => {
        setAuthToken('previous.user.token');
        setCookie('');
        expect(initialToken()).toBeNull();
        expect(getAuthToken()).toBeNull();
        expect(localStorage.getItem('feast:authToken')).toBeNull();
    });

    it('replaces a saved token with the cookie when they differ (switched accounts)', () => {
        setAuthToken('previous.user.token');
        setCookie('X-Tapis-Token=new.user.token');
        expect(initialToken()).toBe('new.user.token');
        expect(getAuthToken()).toBe('new.user.token');
        expect(localStorage.getItem('feast:authToken')).toBe('new.user.token');
    });
});
