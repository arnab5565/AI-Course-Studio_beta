require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session  = require('express-session');
const cors = require('cors');

require('./config/passport'); // load passport strategy

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Session middleware (required by passport even with JWT)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/auth', require('./routes/authRoutes')); // kept for any existing google auth callbacks
app.use('/api/auth', require('./routes/authRoutes')); // used by frontend API
app.use('/api/gemini', require('./routes/geminiRoutes'));
app.listen(5000, () => console.log('Server running on port 5000'));