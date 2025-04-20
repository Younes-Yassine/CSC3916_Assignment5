// backend/models/Users.js
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');

const UserSchema = new mongoose.Schema({
  name:     String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, null, null, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

// comparePassword(pwd, callback(isMatch))
UserSchema.methods.comparePassword = function(pw, cb) {
  bcrypt.compare(pw, this.password, (err, isMatch) => cb(isMatch));
};

module.exports = mongoose.model('User', UserSchema);
