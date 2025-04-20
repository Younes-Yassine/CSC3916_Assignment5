// backend/models/Reviews.js
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const ReviewSchema = new Schema({
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  username:{ type: String, required: true },
  review:  { type: String, required: true },
  rating:  { type: Number, min: 0, max: 5, required: true }
});

module.exports = mongoose.model('Review', ReviewSchema);
