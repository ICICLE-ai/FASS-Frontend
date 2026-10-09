import { Button } from 'react-bootstrap';
import { useAuth } from '../shared/AuthContext.jsx';
import { beginSignIn } from '../shared/tapisAuth.js';

const SignInButton = () => {
    const { isSignedIn, username, signOut } = useAuth();

    if (isSignedIn) {
        return (
            <>
                <span style={{ color: 'white', marginRight: 8, fontSize: 14 }}>
                    {username || 'Signed in'}
                </span>
                <Button
                    variant="light"
                    size="sm"
                    onClick={signOut}
                    style={{ marginRight: 8 }}
                >
                    Sign out
                </Button>
            </>
        );
    }

    return (
        <Button
            variant="light"
            size="sm"
            onClick={() => {
                beginSignIn().catch((err) => {
                    console.error('Failed to start Tapis sign-in', err);
                    alert(err.message || 'Could not start sign-in.');
                });
            }}
            style={{ marginRight: 8 }}
        >
            Sign in with Tapis
        </Button>
    );
};

export default SignInButton;
