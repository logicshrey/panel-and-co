const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function toUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password_hash,
      role: 'customer',
    });

    res.status(201).json({
      user: toUserPayload(user),
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    const valid = user && (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user: toUserPayload(user),
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { registerUser, loginUser, getMe };
