// backend/server.js
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const mongoose    = require('mongoose');
const passport    = require('passport');
const crypto      = require('crypto');
const rp          = require('request-promise');

const auth        = require('./auth');
const authJwt     = require('./auth_jwt');
const User        = require('./models/Users');
const Movie       = require('./models/Movies');
const Review      = require('./models/Reviews');

// Connect to MongoDB
mongoose
  .connect(process.env.DB)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

// *** CORS Setup ***
// Allow your Render‑hosted frontend to access these APIs
const corsOptions = {
  origin: 'https://csc3916-assignment5-frontend.onrender.com',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};
// Handle preflight for all routes
app.options('*', cors(corsOptions));
// Apply CORS to all endpoints
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(passport.initialize());

// (Optional) Google Analytics helper
const GA_TRACKING_ID = process.env.GA_KEY;
function trackEvent(cat, act, label, val, dim, met) {
  return rp({
    method: 'GET',
    url: 'https://www.google-analytics.com/collect',
    qs: {
      v: '1',
      tid: GA_TRACKING_ID,
      cid: crypto.randomBytes(16).toString('hex'),
      t: 'event',
      ec: cat,
      ea: act,
      el: label,
      ev: val,
      cd1: dim,
      cm1: met
    }
  }).catch(console.error);
}

// User routes
app.post('/signup', auth.signup);
app.post('/signin', auth.signin);

// Review routes
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/reviews', authJwt.isAuthenticated, async (req, res) => {
  const { movieId, username, review, rating } = req.body;
  if (!movieId || !username || !review || rating == null) {
    return res.status(400).json({ message: 'Missing fields.' });
  }
  try {
    await new Review({ movieId, username, review, rating }).save();
    // Analytics fire‑and‑forget
    Movie.findById(movieId).then(movie => {
      if (movie) {
        trackEvent(
          movie.genre || 'Unknown',
          'POST /reviews',
          'Review created',
          1,
          movie.title,
          1
        );
      }
    });
    res.json({ message: 'Review created!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete('/reviews/:id', authJwt.isAuthenticated, async (req, res) => {
  try {
    await Review.findByIdAndRemove(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Movie routes
app.get('/movies', authJwt.isAuthenticated, async (req, res) => {
  try {
    if (req.query.reviews === 'true') {
      const movies = await Movie.aggregate([
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'movieId',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            avgRating: { $avg: '$reviews.rating' }
          }
        },
        {
          $sort: { avgRating: -1 }
        }
      ]);
      return res.json(movies);
    } else {
      const movies = await Movie.find();
      return res.json(movies);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Detailed movie endpoint
app.get('/movies/:id', authJwt.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findById(id).lean();
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const reviews = await Review.find({ movieId: id }).lean();
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
    movie.reviews   = reviews;
    movie.avgRating = avgRating;
    return res.json(movie);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid movie id' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(process.env.PORT || 8080, () =>
  console.log('API up on', process.env.PORT || 8080)
);
