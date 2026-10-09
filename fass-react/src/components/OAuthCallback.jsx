import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext.jsx';
import { completeSignIn } from '../shared/tapisAuth.js';

const OAuthCallback = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [error, setError] = useState(null);
    // StrictMode double-mounts in dev; the authorization code is one-use, so
    // guard against the second mount trying to redeem a code that was already
    // consumed on the first.
    const inFlight = useRef(false);

    useEffect(() => {
        if (inFlight.current) return;
        inFlight.current = true;

        const errorParam = params.get('error');
        if (errorParam) {
            setError(params.get('error_description') || errorParam);
            return;
        }

        const code = params.get('code');
        const state = params.get('state');
        if (!code || !state) {
            setError('Missing code or state in callback URL.');
            return;
        }

        completeSignIn({ code, state })
            .then((jwt) => {
                signIn(jwt);
                navigate('/simulation', { replace: true });
            })
            .catch((err) => {
                setError(err.message || String(err));
            });
    }, [params, navigate, signIn]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Sign-in failed</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={() => navigate('/', { replace: true })}
                    >
                        Back to landing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-gray-600">Completing sign-in…</div>
        </div>
    );
};

export default OAuthCallback;
