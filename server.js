const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { generateSalt, hashSequence, verifySequence } = require('./hash');

const app = express();
const PORT = 3000;
const MAX_LOGIN_ATTEMPTS = 5;

// Supabase configuration
const SUPABASE_URL = 'https://kfgnvrugekrvdlgrfqsf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ252cnVnZWtydmRsZ3JmcXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzY1MjcsImV4cCI6MjA4MDQ1MjUyN30.hQc_VLgbcC6N-2I9xnoOzo6bP-xnyWSZt0xlBjLqv80';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Track login attempts (in-memory, resets on server restart)
const loginAttempts = {};

/**
 * POST /register
 * Register a new user with their gamified sequence
 * Body: { userId, sequence }
 */
app.post('/register', async (req, res) => {
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

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
  } catch (err) {
    // User doesn't exist, which is good
  }

  try {
    // Generate salt and hash the sequence
    const salt = generateSalt();
    const hashedSequence = hashSequence(sequence, salt);

    // Insert user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_id: userId,
          password_hash: hashedSequence,
          salt: salt
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // Reset login attempts for new user
    loginAttempts[userId] = 0;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /login
 * Authenticate user by verifying their sequence
 * Body: { userId, sequence }
 */
app.post('/login', async (req, res) => {
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

  try {
    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      loginAttempts[userId]++;
      return res.status(401).json({
        error: 'Invalid userId or sequence',
        attemptsRemaining: MAX_LOGIN_ATTEMPTS - loginAttempts[userId]
      });
    }

    // Verify sequence
    const isValid = verifySequence(sequence, user.salt, user.password_hash);

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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize and start server
app.listen(PORT, () => {
  console.log(`🐧 Penguin Login Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Connected to Supabase: ${SUPABASE_URL}`);
});
