import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refreshSession = useCallback(async () => {
    const session = await api('session');
    setUser(session.isAuthenticated ? session : null);
    setLoading(false);
    setError('');
    return session;
  }, []);
  useEffect(() => {
    refreshSession().catch((failure) => {
      setError(failure.message);
      setLoading(false);
    });
  }, [refreshSession]);
  return <AuthContext.Provider value={{ user, loading, error, refreshSession }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
