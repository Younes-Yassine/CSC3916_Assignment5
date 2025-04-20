// src/components/MovieList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api';

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [error, setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await client.get('/movies?reviews=true');
        setMovies(res.data);
      } catch {
        setError('Failed to fetch movies.');
      }
    }
    fetchMovies();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Top Rated Movies</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}
      >
        {movies.map(m => (
          <div
            key={m._id}
            onClick={() => navigate(`/movies/${m._id}`)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={m.imageUrl}
              alt={m.title}
              style={{ width: '100%', height: 'auto' }}
            />
            <p>{m.title}</p>
            <p>Rating: {m.avgRating ?? 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
