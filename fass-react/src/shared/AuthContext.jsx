import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken } from './client.js';
import { decodeTokenClaims, displayNameFromClaims } from './tapisAuth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Seed from the token client.js already loaded out of localStorage so a
    // signed-in reload doesn't flicker through a "logged out" state.
    const [token, setTokenState] = useState(() => getAuthToken());

    const signIn = useCallback((newToken) => {
        setAuthToken(newToken);
        setTokenState(newToken);
    }, []);

    const signOut = useCallback(() => {
        clearAuthToken();
        setTokenState(null);
    }, []);

    // Guard against a signed-in state with an expired token. Decoding is
    // UNVERIFIED (that's fine for client-side expiry hints -- the backend
    // enforces real verification); if `exp` has passed, clear state so the
    // UI shows signed-out and the next API call falls through to the public
    // pool rather than a 401 cascade.
    useEffect(() => {
        if (!token) return;
        const claims = decodeTokenClaims(token);
        const now = Math.floor(Date.now() / 1000);
        if (claims?.exp && claims.exp <= now) {
            signOut();
        }
    }, [token, signOut]);

    const value = useMemo(() => {
        const claims = token ? decodeTokenClaims(token) : null;
        return {
            token,
            isSignedIn: !!token,
            username: displayNameFromClaims(claims),
            signIn,
            signOut,
        };
    }, [token, signIn, signOut]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}
