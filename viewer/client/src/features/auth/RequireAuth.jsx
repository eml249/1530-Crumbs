import { Navigate, useLocation } from 'react-router-dom';
import StatusMessage from '../../components/StatusMessage';
import { useAuth } from './AuthContext';

// Wrap a page's element in this (see routes.jsx) to make the page sign-in only.
// Signed-out visitors go to /sign-in, which sends them back here afterwards.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-wait">
        <StatusMessage loading />
      </div>
    );
  }
  if (!user) return <Navigate to="/sign-in" replace state={{ from: location }} />;
  return children;
}
