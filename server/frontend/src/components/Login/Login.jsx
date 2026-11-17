import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';

export default function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('login', {
        method: 'POST', body: JSON.stringify({ userName, password })
      });
      await refreshSession();
      navigate(location.state?.from || '/dealers', { replace: true });
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  };
  return <main className="page">
    <section className="auth-card">
      <p className="eyebrow">Welcome back</p><h1>Login</h1>
      <p className="lead-copy">Sign in to share a dealership review.</p>
      <form onSubmit={login}>
        <label className="field" htmlFor="login-username">Username
          <input id="login-username" name="username" autoComplete="username"
            value={userName} onChange={(event) => setUserName(event.target.value)} required />
        </label>
        <label className="field" htmlFor="login-password">Password
          <input id="login-password" name="password" type="password" autoComplete="current-password"
            value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error && <p className="notice error" role="alert">{error}</p>}
        <button type="submit" className="button" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
      </form>
      <p className="form-hint">New to OpenRoad? <Link to="/register">Register</Link></p>
    </section>
  </main>;
}
