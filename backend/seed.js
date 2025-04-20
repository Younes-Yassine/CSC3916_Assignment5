// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Movie    = require('./models/Movies');

// 1. Connect
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ Mongo connect error:', err);
  process.exit(1);
});

// 2. Define your seed data
const movies = [
  {
    title:    'Inception',
    director: 'Christopher Nolan',
    genre:    'Sci-Fi',
    year:      2010,
    imageUrl: 'https://m.media-amazon.com/images/I/61AYEacqlkL._SL1000_.jpg'
  },
  {
    title:    'The Matrix',
    director: 'Lana Wachowski, Lilly Wachowski',
    genre:    'Sci-Fi',
    year:      1999,
    imageUrl: 'https://m.media-amazon.com/images/I/51EG732BV3L.jpg'
  },
  {
    title:    'The Godfather',
    director: 'Francis Ford Coppola',
    genre:    'Crime',
    year:      1972,
    imageUrl: 'https://m.media-amazon.com/images/I/41+eK8zBwQL.jpg'
  }
  // …add as many as you like
];

// 3. Wipe & insert
async function seed() {
  try {
    await Movie.deleteMany({});
    console.log('🗑️  Existing movies removed');
    const inserted = await Movie.insertMany(movies);
    console.log(`📀  Inserted ${inserted.length} movies`);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
