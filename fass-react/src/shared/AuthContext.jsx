import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuthToken, setAuthToken } from './client.js';
import { decodeTokenClaims, displayNameFromClaims, readTapisTokenCookie } from './tapisSession.js';

const AuthContext = createContext(null);

// Seed the auth token from the Tapis session cookie (X-Tapis-Token on
// Domain=icicleai.tapis.io). The cookie is the only source of truth: if it's
// missing, the user isn't signed in to Tapis, so drop any token saved from an
// earlier visit instead of reusing it. Reusing it meant that after signing
// out of Tapis, FEAST kept acting as the previous user in that browser until
// the token expired. The side effect in a useState initializer runs exactly
// once, before any child component renders, so a child's mount-time API call
// sees the right token on client.js's module-level authToken var.
// Exported for AuthContext.test.js.
// eslint-disable-next-line react-refresh/only-export-components
export function initialToken() {
    const cookieToken = readTapisTokenCookie();
    if (cookieToken) {
        setAuthToken(cookieToken);
        return cookieToken;
    }
    clearAuthToken();
    return null;
}

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(initialToken);

    useEffect(() => {
        if (!token) return;
        const claims = decodeTokenClaims(token);
        const now = Math.floor(Date.now() / 1000);
        if (claims?.exp && claims.exp <= now) {
            clearAuthToken();
            setTokenState(null);
        }
    }, [token]);

    const value = useMemo(() => {
        const claims = token ? decodeTokenClaims(token) : null;
        return {
            token,
            isSignedIn: !!token,
            username: displayNameFromClaims(claims),
        };
    }, [token]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}
