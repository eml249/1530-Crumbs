import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../services/api';
import { AuthContext } from './AuthContext';

// Keeps track of who is signed in. The session itself is an httpOnly cookie set
// by the server, so nothing is stored in the browser here: on load we just ask
// the server (GET /api/auth/me), and a 401 means nobody is signed in.
export default function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });

  const refresh = useCallback(async () => {
    try {
      const res = await API.get('/auth/me');
      setState({ user: res.data.user, loading: false });
    } catch (err) {
      if (err.response?.status !== 401) console.error('GET /auth/me failed:', err);
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Throws on failure, so the sign-in form can show the server's message.
  const signIn = useCallback(async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    setState({ user: res.data.user, loading: false });
    return res.data.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      setState({ user: null, loading: false });
    }
  }, []);

  const value = useMemo(() => ({ ...state, signIn, signOut, refresh }), [state, signIn, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
