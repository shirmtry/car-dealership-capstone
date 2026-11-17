import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { api } from '../../api';

export default function Header() {
  const { user, loading, error, refreshSession } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await api('logout', { method: 'POST' });
      await refreshSession();
      navigate('/');
    } catch (failure) {
      setLogoutError(failure.message);
    }
  };
  return <header className="site-header">
    <nav className="site-nav" aria-label="Main navigation">
      <Link className="brand" to="/">OpenRoad<small>Car Dealerships</small></Link>
      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/dealers">Dealerships</NavLink>
        <a href="/about">About Us</a><a href="/contact">Contact Us</a>
      </div>
      <div className="auth-links">
        {loading ? <span>Checking session...</span> : user ? <>
          <span className="username" data-testid="username">{user.userName}</span>
          <button className="nav-button" type="button" onClick={logout}>Logout</button>
        </> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
        {(error || logoutError) && <span role="alert">{error || logoutError}</span>}
      </div>
    </nav>
  </header>;
}
