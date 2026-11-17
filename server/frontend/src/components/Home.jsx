import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { user } = useAuth();
  return <main className="page home-page">
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">Your next journey starts here</p>
        <h1>Welcome to our Dealerships!</h1>
        <p>Find your next car with confidence. Explore dealerships across the United States,
          learn from customer reviews, and share your own experience.</p>
        <div className="hero-actions"><Link className="button" to="/dealers">View Dealerships</Link>
          {!user && <Link className="button secondary" to="/register">Create an account</Link>}
        </div>
      </div>
      <img className="hero-image" src="/static/car_dealership.jpg" alt="Cars on display at a dealership" />
    </section>
    <div className="feature-grid">
      <section><span className="feature-number">01</span><h2>Find your local dealer</h2><p>Browse the network and filter dealerships by state.</p></section>
      <section><span className="feature-number">02</span><h2>Read customer stories</h2><p>See car buyers' experiences and review sentiment.</p></section>
      <section><span className="feature-number">03</span><h2>Share your experience</h2><p>Sign in and leave a review for your dealership.</p></section>
    </div>
  </main>;
}
