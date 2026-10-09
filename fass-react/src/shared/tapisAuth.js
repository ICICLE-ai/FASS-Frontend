// Tapis OAuth2 helpers for the Authorization Code flow.
//
// Backend contract (ICICLE-ai/Food-Access-Model#102): the API accepts an
// optional `Authorization: Bearer <jwt>` header. This module lives alongside
// client.js and feeds the token into setAuthToken() once a Tapis sign-in
// completes.
//
// Flow:
//   1. User clicks "Sign in with Tapis" -> beginSignIn() redirects the browser
//      to Tapis's /v3/oauth2/authorize with our client_id and redirect_uri.
//   2. Tapis authenticates the user and redirects back to <origin>/oauth/callback
//      with ?code=<authorization code>.
//   3. OAuthCallback mounts, calls completeSignIn(code), which POSTs the code
//      to /v3/oauth2/tokens and gets back a JWT.
//   4. The JWT is handed to setAuthToken() so every subsequent API request
//      carries it.
//
// Still TBD and waiting on Christian (TACC Tapis contact, routed via Alfonso):
//   - Whether the ICICLE Tapis tenant will register us for Authorization Code
//     with PKCE (preferred for SPAs; no client secret in the browser) or
//     standard Authorization Code (which needs client_key present at token
//     exchange). The token-exchange body below assumes PKCE-style public
//     client and will be updated once Christian confirms. Fallback plan if
//     only standard Auth Code is available: proxy the token exchange through
//     the FEAST backend so the client_key never ships to the browser.
//   - Final client_id after Christian registers us. Env var placeholder for now.
//   - Confirmed redirect_uri. The code uses `${window.location.origin}/oauth/callback`;
//     Christian must register exactly that URL (both dev and prod origins).

const DEFAULT_TAPIS_BASE_URL = 'https://icicle.tapis.io';
const OAUTH_STATE_STORAGE_KEY = 'feast:oauthState';
const OAUTH_PKCE_VERIFIER_STORAGE_KEY = 'feast:oauthPkceVerifier';

function tapisBaseUrl() {
    return import.meta.env.VITE_TAPIS_BASE_URL || DEFAULT_TAPIS_BASE_URL;
}

function tapisClientId() {
    return import.meta.env.VITE_TAPIS_CLIENT_ID || '';
}

export function getRedirectUri() {
    // Must match the callback_url Tapis has registered for this client. If
    // the two don't line up Tapis refuses the authorize request outright.
    return `${window.location.origin}/oauth/callback`;
}

// Short random string used to tie the redirect back to the user's own browser
// (OAuth2 CSRF protection -- RFC 6749 10.12). Stored in sessionStorage so a
// cross-tab callback can't complete someone else's sign-in; cleared on use.
function generateRandomString(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    // base64url without padding -- safe to use directly in a URL
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function sha256Base64Url(input) {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function buildAuthorizeUrl({ state, codeChallenge }) {
    const params = new URLSearchParams({
        client_id: tapisClientId(),
        redirect_uri: getRedirectUri(),
        response_type: 'code',
        state,
    });
    if (codeChallenge) {
        params.set('code_challenge', codeChallenge);
        params.set('code_challenge_method', 'S256');
    }
    return `${tapisBaseUrl()}/v3/oauth2/authorize?${params.toString()}`;
}

export async function beginSignIn() {
    if (!tapisClientId()) {
        // Fail loud rather than redirect to a Tapis page that will reject us
        // with a less obvious error -- most likely cause of a missing client
        // id is that the env var wasn't threaded through to the build.
        throw new Error(
            'VITE_TAPIS_CLIENT_ID is not set. Confirm the Tapis client registration ' +
            'is complete and the env var is populated for this build mode.'
        );
    }
    const state = generateRandomString(16);
    const verifier = generateRandomString(32);
    const challenge = await sha256Base64Url(verifier);
    try {
        sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
        sessionStorage.setItem(OAUTH_PKCE_VERIFIER_STORAGE_KEY, verifier);
    } catch {
        // sessionStorage disabled (private browsing, policy, etc.). The
        // callback will fail state verification but we don't want to abort
        // the whole redirect here -- let the user see Tapis's own error page
        // if they get that far.
    }
    window.location.assign(buildAuthorizeUrl({ state, codeChallenge: challenge }));
}

function readAndClearSessionItem(key) {
    try {
        const value = sessionStorage.getItem(key);
        sessionStorage.removeItem(key);
        return value;
    } catch {
        return null;
    }
}

export async function completeSignIn({ code, state, fetchImpl = fetch }) {
    const expectedState = readAndClearSessionItem(OAUTH_STATE_STORAGE_KEY);
    const codeVerifier = readAndClearSessionItem(OAUTH_PKCE_VERIFIER_STORAGE_KEY);

    if (!expectedState || expectedState !== state) {
        // Mismatched state means either sessionStorage was cleared mid-flow
        // or the callback came from a flow this browser didn't start.
        // Either way, refuse to exchange the code.
        throw new Error('OAuth state mismatch. Please try signing in again.');
    }

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: getRedirectUri(),
        client_id: tapisClientId(),
    });
    if (codeVerifier) {
        body.set('code_verifier', codeVerifier);
    }

    const response = await fetchImpl(`${tapisBaseUrl()}/v3/oauth2/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
            `Tapis token exchange failed (HTTP ${response.status})` +
            (text ? `: ${text}` : '')
        );
    }

    const payload = await response.json();

    // Tapis's token response shape puts the JWT at result.access_token.access_token
    // in the typical envelope. Accept both the direct `access_token` form and
    // the nested one so this doesn't break if Christian confirms a non-standard
    // response shape.
    const jwt =
        payload?.result?.access_token?.access_token ||
        payload?.access_token?.access_token ||
        payload?.access_token ||
        null;
    if (!jwt || typeof jwt !== 'string') {
        throw new Error('Tapis token response did not include an access token.');
    }
    return jwt;
}

export function decodeTokenClaims(jwt) {
    // UNVERIFIED decode -- for display only. Never trust claims from this on
    // the client side for anything the backend needs to enforce; verification
    // happens on the backend (food_access_model/api/token_verification.py).
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
