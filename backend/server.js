// backend/server.js
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const passport   = require('passport');
const crypto     = require('crypto');
const rp         = require('request-promise');

const auth    = require('./auth');
const authJwt = require('./auth_jwt');
const Movie   = require('./models/Movies');
const Review  = require('./models/Reviews');

// 1) Connect to MongoDB
mongoose
  .connect(process.env.DB)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

// 2) Enable CORS for *all* origins and methods
app.use(cors());

// 3) Parse JSON bodies and init Passport
app.use(bodyParser.json());
app.use(passport.initialize());

// (Optional) Google Analytics helper
const GA_TRACKING_ID = process.env.GA_KEY;
function trackEvent(cat, act, label, val, dim, met) {
  return rp({
    method: 'GET',
    url: 'https://www.google-analytics.com/collect',
    qs: {
      v:   '1',
      tid: GA_TRACKING_ID,
      cid: crypto.randomBytes(16).toString('hex'),
      t:   'event',
      ec:  cat,
      ea:  act,
      el:  label,
      ev:  val,
      cd1: dim,
      cm1: met
    }
  }).catch(console.error);
}

// 4) Auth routes
app.post('/signup', auth.signup);
app.post('/signin', auth.signin);

// 5) Review routes
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
    // fire-and-forget analytics
    Movie.findById(movieId).then(m => {
      if (m) {
        trackEvent(
          m.genre || 'Unknown',
          'POST /reviews',
          'Review created',
          1,
          m.title,
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

// 6) Movie list
app.get('/movies', authJwt.isAuthenticated, async (req, res) => {
  try {
    if (req.query.reviews === 'true') {
      const movies = await Movie.aggregate([
        { $lookup: {
            from:         'reviews',
            localField:   '_id',
            foreignField: 'movieId',
            as:           'reviews'
        }},
        { $addFields: { avgRating: { $avg: '$reviews.rating' } } },
        { $sort: { avgRating: -1 } }
      ]);
      return res.json(movies);
    }
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7) Movie detail
app.get('/movies/:id', authJwt.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findById(id).lean();
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const reviews = await Review.find({ movieId: id }).lean();
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    movie.reviews   = reviews;
    movie.avgRating = avgRating;
    res.json(movie);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid movie id' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 8) Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API up on ${PORT}`));
