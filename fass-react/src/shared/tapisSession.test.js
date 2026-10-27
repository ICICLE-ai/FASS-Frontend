import { describe, it, expect, afterEach, vi } from 'vitest';

// Minimal document stub so tapisSession.js can read cookies without jsdom.
function setDocumentCookie(cookie) {
    vi.stubGlobal('document', { cookie });
}

const {
    readTapisTokenCookie,
    decodeTokenClaims,
    displayNameFromClaims,
} = await import('./tapisSession.js');

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('readTapisTokenCookie', () => {
    it('returns null when document.cookie is empty', () => {
        setDocumentCookie('');
        expect(readTapisTokenCookie()).toBeNull();
    });

    it('returns the token when X-Tapis-Token is the only cookie', () => {
        setDocumentCookie('X-Tapis-Token=the.jwt.value');
        expect(readTapisTokenCookie()).toBe('the.jwt.value');
    });

    it('returns the token when X-Tapis-Token is one of several cookies', () => {
        setDocumentCookie('foo=bar; X-Tapis-Token=the.jwt.value; baz=qux');
        expect(readTapisTokenCookie()).toBe('the.jwt.value');
    });

    it('tolerates leading whitespace between cookie entries', () => {
        setDocumentCookie('foo=bar;  X-Tapis-Token=the.jwt.value');
        expect(readTapisTokenCookie()).toBe('the.jwt.value');
    });

    it('returns null when X-Tapis-Token is absent even if other cookies exist', () => {
        setDocumentCookie('foo=bar; session=abc');
        expect(readTapisTokenCookie()).toBeNull();
    });

    it('does not match a different cookie whose name contains X-Tapis-Token as a substring', () => {
        // A cookie named "Not-X-Tapis-Token" or similar shouldn't satisfy the
        // prefix check -- otherwise we'd leak whatever that cookie's value is
        // as the JWT and the backend would reject it.
        setDocumentCookie('Not-X-Tapis-Token=garbage; foo=bar');
        expect(readTapisTokenCookie()).toBeNull();
    });

    it('returns null when the X-Tapis-Token cookie is present but empty', () => {
        setDocumentCookie('X-Tapis-Token=; foo=bar');
        expect(readTapisTokenCookie()).toBeNull();
    });

    it('returns null when document is unavailable (SSR safety)', () => {
        vi.stubGlobal('document', undefined);
        expect(readTapisTokenCookie()).toBeNull();
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
        const jwt = makeJwt({ sub: 'jdoe@icicleai', exp: 123, 'tapis/username': 'jdoe' });
        expect(decodeTokenClaims(jwt)).toEqual({
            sub: 'jdoe@icicleai',
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
        expect(displayNameFromClaims({ sub: 'jdoe@icicleai' })).toBe('jdoe');
    });

    it('returns sub unchanged when it has no @ separator', () => {
        expect(displayNameFromClaims({ sub: 'jdoe' })).toBe('jdoe');
    });

    it('falls back to tapis/username when sub is absent', () => {
        expect(displayNameFromClaims({ 'tapis/username': 'jdoe' })).toBe('jdoe');
    });

    it('falls back to preferred_username as a last resort', () => {
        expect(displayNameFromClaims({ preferred_username: 'jdoe' })).toBe('jdoe');
    });

    it('returns null when nothing identifies the user', () => {
        expect(displayNameFromClaims({})).toBeNull();
        expect(displayNameFromClaims(null)).toBeNull();
    });
});
