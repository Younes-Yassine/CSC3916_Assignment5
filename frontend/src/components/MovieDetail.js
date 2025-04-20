// src/components/MovieDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie]           = useState(null);
  const [error, setError]           = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating]         = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await client.get(`/movies/${id}?reviews=true`);
        setMovie(res.data);
      } catch (err) {
        console.error('Error loading movie:', err.response || err);
        setError(`Failed to load movie: ${err.response?.data?.error || err.message}`);
      }
    };
    fetchMovie();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('🔔 handleSubmit called', { reviewText, rating, id });
    setSubmitting(true);
    setError('');

    try {
      // Retrieve raw JWT (may be "JWT <token>" or just "<token>")
      const stored = localStorage.getItem('jwt') || '';
      const rawToken = stored.includes(' ') ? stored.split(' ')[1] : stored;
      // Split into parts and decode the payload
      const parts = rawToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      const payload = JSON.parse(atob(parts[1]));
      const username = payload.username;

      // POST the new review (username from token)
      await client.post('/reviews', {
        movieId: id,
        username,
        review: reviewText,
        rating: Number(rating)
      });

      // Clear form and reload movie data
      setReviewText('');
      setRating(0);
      const res = await client.get(`/movies/${id}?reviews=true`);
      setMovie(res.data);

    } catch (err) {
      console.error('Review submission error:', err.response || err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message;
      setError(`Failed to submit review: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!movie) return <p>Loading…</p>;

  return (
    <div>
      <h2>{movie.title}</h2>
      <img
        src={movie.imageUrl}
        alt={movie.title}
        style={{ maxWidth: '300px', height: 'auto' }}
      />
      <p>Director: {movie.director}</p>
      <p>Genre: {movie.genre}</p>
      <p>Year: {movie.year}</p>
      <p>Average Rating: {movie.avgRating ?? 'N/A'}</p>

      <h3>Reviews</h3>
      {movie.reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {movie.reviews.map(r => (
            <li key={r._id}>
              <strong>{r.username}</strong>: {r.review} ({r.rating}/5)
            </li>
          ))}
        </ul>
      )}

      <h3>Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Your review"
            required
          />
        </div>
        <div>
          <label>
            Rating:{' '}
            <select
              value={rating}
              onChange={e => setRating(e.target.value)}
              required
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={submitting}>
          Submit
        </button>
      </form>
    </div>
  );
}
