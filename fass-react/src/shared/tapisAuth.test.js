import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Minimal browser-ish globals so tapisAuth.js can import without crashing in
// the default node vitest env (no jsdom configured).
function makeFakeSessionStorage() {
    const store = new Map();
    return {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => { store.set(k, String(v)); },
        removeItem: (k) => { store.delete(k); },
        clear: () => { store.clear(); },
    };
}

vi.stubGlobal('window', { location: { origin: 'https://feast.example.test' } });
vi.stubGlobal('sessionStorage', makeFakeSessionStorage());
vi.stubGlobal('crypto', globalThis.crypto); // real WebCrypto in node >=20
vi.stubEnv('VITE_TAPIS_BASE_URL', 'https://icicle.tapis.io');
vi.stubEnv('VITE_TAPIS_CLIENT_ID', 'test-client');

const {
    buildAuthorizeUrl,
    completeSignIn,
    decodeTokenClaims,
    displayNameFromClaims,
    getRedirectUri,
} = await import('./tapisAuth.js');

beforeEach(() => {
    sessionStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getRedirectUri', () => {
    it('derives the callback URL from window.location.origin', () => {
        expect(getRedirectUri()).toBe('https://feast.example.test/oauth/callback');
    });
});

describe('buildAuthorizeUrl', () => {
    it('includes client_id, redirect_uri, response_type, state', () => {
        const url = new URL(buildAuthorizeUrl({ state: 'abc123' }));
        expect(url.origin + url.pathname).toBe('https://icicle.tapis.io/v3/oauth2/authorize');
        expect(url.searchParams.get('client_id')).toBe('test-client');
        expect(url.searchParams.get('redirect_uri')).toBe('https://feast.example.test/oauth/callback');
        expect(url.searchParams.get('response_type')).toBe('code');
        expect(url.searchParams.get('state')).toBe('abc123');
    });

    it('includes PKCE challenge params when a code_challenge is passed', () => {
        const url = new URL(buildAuthorizeUrl({ state: 'x', codeChallenge: 'ch' }));
        expect(url.searchParams.get('code_challenge')).toBe('ch');
        expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    });

    it('omits PKCE params when no challenge is passed', () => {
        const url = new URL(buildAuthorizeUrl({ state: 'x' }));
        expect(url.searchParams.get('code_challenge')).toBeNull();
        expect(url.searchParams.get('code_challenge_method')).toBeNull();
    });
});

describe('decodeTokenClaims', () => {
    function makeJwt(claims) {
        const b64 = (obj) =>
            btoa(JSON.stringify(obj))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        return `${b64({ typ: 'JWT', alg: 'RS256' })}.${b64(claims)}.sig`;
    }

    it('reads claims from a well-formed JWT payload', () => {
        const jwt = makeJwt({ sub: 'jdoe@icicle', exp: 123, 'tapis/username': 'jdoe' });
        expect(decodeTokenClaims(jwt)).toEqual({
            sub: 'jdoe@icicle',
            exp: 123,
            'tapis/username': 'jdoe',
        });
    });

    it('returns null on a malformed token rather than throwing', () => {
        expect(decodeTokenClaims('not-a-jwt')).toBeNull();
        expect(decodeTokenClaims('')).toBeNull();
    });
});

describe('displayNameFromClaims', () => {
    it('prefers the username portion of sub (Tapis username@tenant form)', () => {
        expect(displayNameFromClaims({ sub: 'jdoe@icicle' })).toBe('jdoe');
    });

    it('falls back to tapis/username when sub is absent', () => {
        expect(displayNameFromClaims({ 'tapis/username': 'jdoe' })).toBe('jdoe');
    });

    it('returns null when nothing identifies the user', () => {
        expect(displayNameFromClaims({})).toBeNull();
        expect(displayNameFromClaims(null)).toBeNull();
    });
});

describe('completeSignIn', () => {
    it('refuses to exchange when state does not match the one begun this session', async () => {
        sessionStorage.setItem('feast:oauthState', 'original');
        await expect(
            completeSignIn({ code: 'c', state: 'tampered', fetchImpl: vi.fn() })
        ).rejects.toThrow(/state mismatch/i);
    });

    it('refuses when there is no state in sessionStorage (callback for a flow this browser did not start)', async () => {
        await expect(
            completeSignIn({ code: 'c', state: 'x', fetchImpl: vi.fn() })
        ).rejects.toThrow(/state mismatch/i);
    });

    it('POSTs the authorization code and returns the JWT from the Tapis envelope', async () => {
        sessionStorage.setItem('feast:oauthState', 'matched');
        sessionStorage.setItem('feast:oauthPkceVerifier', 'verifier-abc');

        const fetchImpl = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                result: { access_token: { access_token: 'the.jwt.here' } },
            }),
            text: async () => '',
        });

        const jwt = await completeSignIn({ code: 'the-code', state: 'matched', fetchImpl });
        expect(jwt).toBe('the.jwt.here');

        expect(fetchImpl).toHaveBeenCalledTimes(1);
        const [url, init] = fetchImpl.mock.calls[0];
        expect(url).toBe('https://icicle.tapis.io/v3/oauth2/tokens');
        expect(init.method).toBe('POST');
        expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');

        const body = new URLSearchParams(init.body);
        expect(body.get('grant_type')).toBe('authorization_code');
        expect(body.get('code')).toBe('the-code');
        expect(body.get('redirect_uri')).toBe('https://feast.example.test/oauth/callback');
        expect(body.get('client_id')).toBe('test-client');
        expect(body.get('code_verifier')).toBe('verifier-abc');
    });

    it('throws a descriptive error when Tapis responds non-200', async () => {
        sessionStorage.setItem('feast:oauthState', 'matched');
        const fetchImpl = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({}),
            text: async () => 'invalid_grant',
        });
        await expect(
            completeSignIn({ code: 'c', state: 'matched', fetchImpl })
        ).rejects.toThrow(/HTTP 400.*invalid_grant/);
    });

    it('accepts the flatter { access_token: "..." } response shape as a fallback', async () => {
        sessionStorage.setItem('feast:oauthState', 'matched');
        const fetchImpl = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ access_token: 'flat.jwt' }),
            text: async () => '',
        });
        const jwt = await completeSignIn({ code: 'c', state: 'matched', fetchImpl });
        expect(jwt).toBe('flat.jwt');
    });

    it('clears state and verifier from sessionStorage after a successful exchange', async () => {
        sessionStorage.setItem('feast:oauthState', 'matched');
        sessionStorage.setItem('feast:oauthPkceVerifier', 'v');
        const fetchImpl = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ access_token: 'j' }),
            text: async () => '',
        });
        await completeSignIn({ code: 'c', state: 'matched', fetchImpl });
        expect(sessionStorage.getItem('feast:oauthState')).toBeNull();
        expect(sessionStorage.getItem('feast:oauthPkceVerifier')).toBeNull();
    });
});
