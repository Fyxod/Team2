const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const Queue = require('./models/Queue');


const app = express();
const PORT = 5000;

// DB Connection
mongoose.connect('mongodb://localhost:27017/userAuthDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// User model
const User = require('./models/User');

// Login POST
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.send('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send('Invalid credentials');

  req.session.user = user;
  res.redirect('/home.html');
});

// Signup POST
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.send('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  res.redirect('/index.html');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/index.html');
});



app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
