// backend/models/Movies.js
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const MovieSchema = new Schema({
  title:    { type: String, required: true, index: true },
  director: String,
  genre:    String,
  year:     { type: Number, min:1900, max:2100 },
  imageUrl: String
});

module.exports = mongoose.model('Movie', MovieSchema);
