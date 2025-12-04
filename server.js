const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateSalt, hashSequence, verifySequence } = require('./hash');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');
const MAX_LOGIN_ATTEMPTS = 5;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize users.json if it doesn't exist
function initializeUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: {} }, null, 2));
  }
}

// Load users from JSON
function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: {} };
  }
}

// Save users to JSON
function saveUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// Track login attempts (in-memory, resets on server restart)
const loginAttempts = {};

/**
 * POST /register
 * Register a new user with their gamified sequence
 * Body: { userId, sequence }
 */
app.post('/register', (req, res) => {
  const { userId, sequence } = req.body;

  if (!userId || !sequence) {
    return res.status(400).json({ error: 'Missing userId or sequence' });
  }

  if (userId.length < 3) {
    return res.status(400).json({ error: 'userId must be at least 3 characters' });
  }

  if (sequence.length < 6) {
    return res.status(400).json({ error: 'Sequence must be at least 6 characters' });
  }

  const users = loadUsers();

  if (users.users[userId]) {
    return res.status(409).json({ error: 'User already exists' });
  }

  // Generate salt and hash the sequence
  const salt = generateSalt();
  const hashedSequence = hashSequence(sequence, salt);

  // Store user
  users.users[userId] = {
    salt,
    hashedSequence,
    createdAt: new Date().toISOString()
  };

  saveUsers(users);

  // Reset login attempts for new user
  loginAttempts[userId] = 0;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    userId
  });
});

/**
 * POST /login
 * Authenticate user by verifying their sequence
 * Body: { userId, sequence }
 */
app.post('/login', (req, res) => {
  const { userId, sequence } = req.body;

  if (!userId || !sequence) {
    return res.status(400).json({ error: 'Missing userId or sequence' });
  }

  // Check login attempts
  if (!loginAttempts[userId]) {
    loginAttempts[userId] = 0;
  }

  if (loginAttempts[userId] >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
      attemptsRemaining: 0
    });
  }

  const users = loadUsers();
  const user = users.users[userId];

  if (!user) {
    loginAttempts[userId]++;
    return res.status(401).json({
      error: 'Invalid userId or sequence',
      attemptsRemaining: MAX_LOGIN_ATTEMPTS - loginAttempts[userId]
    });
  }

  // Verify sequence
  const isValid = verifySequence(sequence, user.salt, user.hashedSequence);

  if (!isValid) {
    loginAttempts[userId]++;
    return res.status(401).json({
      error: 'Invalid userId or sequence',
      attemptsRemaining: MAX_LOGIN_ATTEMPTS - loginAttempts[userId]
    });
  }

  // Successful login
  loginAttempts[userId] = 0;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    userId,
    token: `token_${userId}_${Date.now()}`
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize and start server
initializeUsersFile();

app.listen(PORT, () => {
  console.log(`🐧 Penguin Login Server running on http://localhost:${PORT}`);
  console.log(`📁 Users stored in: ${USERS_FILE}`);
});
