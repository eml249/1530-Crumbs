import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './AccountStatus.css';

// Right-hand end of the nav bar: who is signed in, with a sign-out button.
export default function AccountStatus() {
  const { user, loading, signOut } = useAuth();
  if (loading) return null;

  return (
    <div className="acct">
      {user ? (
        <>
          <span className="acct-user" title={user.email}>
            {user.name}
          </span>
          <button type="button" className="acct-signout" onClick={signOut}>
            Sign out
          </button>
        </>
      ) : (
        <NavLink to="/sign-in">Sign in</NavLink>
      )}
    </div>
  );
}
