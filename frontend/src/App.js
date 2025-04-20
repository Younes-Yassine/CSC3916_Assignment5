import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SignUp      from './components/SignUp';
import Login       from './components/Login';
import MovieList   from './components/MovieList';
import MovieDetail from './components/MovieDetail';

export default function App() {
  return (
    <>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Home</Link> |{' '}
        <Link to="/signup">Sign Up</Link> |{' '}
        <Link to="/login">Log In</Link>
      </nav>
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/" element={<MovieList />} />
        </Routes>
      </div>
    </>
  );
}
