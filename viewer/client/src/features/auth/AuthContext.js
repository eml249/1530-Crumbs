import { createContext, useContext } from 'react';

// { user, loading, signIn(username, password), signOut(), refresh() }
// user is { username, name, email } or null. Provided by AuthProvider.jsx.
export const AuthContext = createContext(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth() must be used inside <AuthProvider>');
  return auth;
}
