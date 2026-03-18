const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId:   { type: String, unique: true, sparse: true }, // Optional for email signups, unique if provided
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String }, // Optional for Google Auth users
  avatar:     { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);