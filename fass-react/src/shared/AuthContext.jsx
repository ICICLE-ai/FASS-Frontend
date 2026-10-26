import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken } from './client.js';
import { decodeTokenClaims, displayNameFromClaims, readTapisTokenCookie } from './tapisSession.js';

const AuthContext = createContext(null);

// Seed the auth token from the Tapis pods gateway cookie (X-Tapis-Token on
// Domain=icicleai.tapis.io). Falls back to whatever client.js already loaded
// out of localStorage so a reload doesn't flash through a logged-out state
// if the gateway cookie expired this tab. The side effect in a useState
// initializer runs exactly once, before any child component renders, so a
// child's mount-time API call will see the token on client.js's module-level
// authToken var.
function initialToken() {
    const cookieToken = readTapisTokenCookie();
    if (cookieToken) {
        setAuthToken(cookieToken);
        return cookieToken;
    }
    return getAuthToken();
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
