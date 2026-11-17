import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    userName: '', firstName: '', lastName: '', email: '',
    password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();
  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };
  const register = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const data = {
        userName: form.userName, firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password
      };
      await api('register', { method: 'POST', body: JSON.stringify(data) });
      await refreshSession();
      navigate('/dealers', { replace: true });
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  };
  return <main className="page">
    <section className="auth-card">
      <p className="eyebrow">Join OpenRoad</p>
      <h1>Create an account</h1>
      <p className="lead-copy">Share your experience and help the next car buyer.</p>
      <form onSubmit={register}>
        <label className="field" htmlFor="register-username">Username
          <input id="register-username" name="userName" autoComplete="username"
            value={form.userName} onChange={update} maxLength={150} required />
        </label>
        <div className="form-grid">
          <label className="field" htmlFor="register-firstname">First Name
            <input id="register-firstname" name="firstName" autoComplete="given-name"
              value={form.firstName} onChange={update} maxLength={150} required />
          </label>
          <label className="field" htmlFor="register-lastname">Last Name
            <input id="register-lastname" name="lastName" autoComplete="family-name"
              value={form.lastName} onChange={update} maxLength={150} required />
          </label>
        </div>
        <label className="field" htmlFor="register-email">Email
          <input id="register-email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={update} required />
        </label>
        <div className="form-grid">
          <label className="field" htmlFor="register-password">Password
            <input id="register-password" name="password" type="password"
              autoComplete="new-password" minLength={8} value={form.password}
              onChange={update} required />
          </label>
          <label className="field" htmlFor="register-confirm">Confirm Password
            <input id="register-confirm" name="confirmPassword" type="password"
              autoComplete="new-password" minLength={8} value={form.confirmPassword}
              onChange={update} required />
          </label>
        </div>
        {error && <p className="notice error" role="alert">{error}</p>}
        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="form-hint">Already registered? <Link to="/login">Login</Link></p>
    </section>
  </main>;
}
