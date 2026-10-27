// Tapis session helpers for the ICICLE deployment.
//
// The FEAST SPA is served from `fass.pods.icicleai.tapis.io`. The Tapis pods
// gateway logs the user in before our SPA loads and sets an `X-Tapis-Token`
// cookie with Domain=icicleai.tapis.io, which the browser then sends to any
// `*.pods.icicleai.tapis.io` subdomain. The cookie is not HttpOnly, so we can
// read the raw JWT out of document.cookie and hand it to setAuthToken().
// Reference: tapis-project/pods_service service/tapis_auth_utils.py:583-584.

const TAPIS_TOKEN_COOKIE_NAME = 'X-Tapis-Token';

export function readTapisTokenCookie() {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const prefix = `${TAPIS_TOKEN_COOKIE_NAME}=`;
    for (const part of document.cookie.split(';')) {
        const trimmed = part.trimStart();
        if (trimmed.startsWith(prefix)) {
            const value = trimmed.slice(prefix.length);
            return value || null;
        }
    }
    return null;
}

export function decodeTokenClaims(jwt) {
    // UNVERIFIED decode -- for display and client-side expiry hints only. The
    // backend verifies via JWKS (food_access_model/api/token_verification.py).
    try {
        const [, payloadB64] = jwt.split('.');
        if (!payloadB64) return null;
        const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '==='.slice((base64.length + 3) % 4);
        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function displayNameFromClaims(claims) {
    if (!claims) return null;
    // Tapis `sub` is `username@tenant`; prefer the bare username for display.
    const sub = claims.sub;
    if (typeof sub === 'string' && sub.length > 0) {
        return sub.split('@')[0] || sub;
    }
    return claims['tapis/username'] || claims.preferred_username || null;
}
