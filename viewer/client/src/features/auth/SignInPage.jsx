import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useApiGet from '../../hooks/useApiGet';
import { useAuth } from './AuthContext';
import './SignInPage.css';

// MOCK sign-in. Stands in for Pitt SSO until the project has access to it: the
// server only accepts the demo accounts in server/src/auth/mockUsers.js.
// When SSO arrives, this form becomes a "Sign in with Pitt" button that
// follows the loginUrl from GET /api/auth/provider.
export default function SignInPage() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const { data: provider } = useApiGet('/auth/provider');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Signed in (already, or just now): go back to the page that sent us here.
  if (user) return <Navigate to={location.state?.from ?? '/bookings'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(username, password);
    } catch (err) {
      setError(err.response?.data?.error ?? 'The server did not answer. Check that the viewer server is running, then try again.');
      setSubmitting(false);
    }
  }

  function fillDemoAccount(account) {
    setUsername(account.username);
    setPassword(provider.demoPassword);
    setError('');
  }

  const canSubmit = username.trim() !== '' && password !== '' && !submitting;

  return (
    <div className="si">
      <div className="si-panel">
        <h1>Sign in</h1>
        <p className="si-sub">Use your Pitt account to see your study room bookings.</p>

        <p className="si-mock" role="note">
          This is a development stand-in for Pitt sign-in. It only knows the demo accounts below, so don&apos;t
          enter your real Pitt password here.
        </p>

        <form className="si-form" onSubmit={handleSubmit}>
          <label>
            Pitt username
            <input
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="abc123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="si-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="si-submit" disabled={!canSubmit}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {provider?.demoAccounts?.length > 0 && (
          <section className="si-demo" aria-labelledby="si-demo-title">
            <h2 id="si-demo-title">Demo accounts</h2>
            <p>
              Every demo account uses the password <code>{provider.demoPassword}</code>.
            </p>
            <ul>
              {provider.demoAccounts.map((a) => (
                <li key={a.username}>
                  <span>
                    <strong>{a.username}</strong> {a.name}
                    <span className="si-demo-count">
                      {a.bookings === 0 ? 'no bookings' : `${a.bookings} booking${a.bookings === 1 ? '' : 's'}`}
                    </span>
                  </span>
                  <button type="button" onClick={() => fillDemoAccount(a)}>
                    Fill in
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
