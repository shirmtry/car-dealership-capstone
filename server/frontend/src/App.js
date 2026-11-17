import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dealers from './components/Dealers/Dealers';
import Dealer from './components/Dealers/Dealer';
import PostReview from './components/Dealers/PostReview';
import Header from './components/Header/Header';
import Home from './components/Home';
import { About, Contact } from './components/InfoPages';
import { AuthProvider } from './AuthContext';
import './components/Register/Auth.css';
import './App.css';

export default function App() {
  return <AuthProvider><Header /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dealers" element={<Dealers />} />
    <Route path="/dealer/:id" element={<Dealer />} />
    <Route path="/postreview/:id" element={<PostReview />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="*" element={<main className="page"><h1>Page not found</h1><a href="/">Return home</a></main>} />
  </Routes><footer className="site-footer">OpenRoad · IBM Full Stack Developer Capstone</footer></AuthProvider>;
}
