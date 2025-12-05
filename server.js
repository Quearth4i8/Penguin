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

// Security questions for account recovery
const SECURITY_QUESTIONS = [
  {
    id: 1,
    question: "What's your favorite penguin movie?",
    options: ['Madagascar', 'Happy Feet', 'The Lion King', 'Frozen'],
    correctAnswer: 'Happy Feet'
  },
  {
    id: 2,
    question: "Which Linux distro is the coolest?",
    options: ['Ubuntu', 'Windows', 'macOS', 'Android'],
    correctAnswer: 'Ubuntu'
  },
  {
    id: 3,
    question: "How many penguins does it take to change a lightbulb?",
    options: ['5', '3', '1', '10'],
    correctAnswer: '3'
  },
  {
    id: 4,
    question: "What's the best open source project?",
    options: ['Linux', 'Microsoft Office', 'Adobe Photoshop', 'Slack'],
    correctAnswer: 'Linux'
  },
  {
    id: 5,
    question: "What do penguins say?",
    options: ['Meow', 'Wak Wak', 'Moo', 'Chirp'],
    correctAnswer: 'Wak Wak'
  }
];

// Track recovery attempts (in-memory)
const recoveryAttempts = {};

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
 * POST /get-recovery-questions
 * Get security questions for recovery (no sequence verification needed)
 */
app.post('/get-recovery-questions', async (req, res) => {
  try {
    const sessionId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize recovery session
    recoveryAttempts[sessionId] = {
      userId: null, // Will be set after questions are answered
      correctAnswers: 0,
      totalAttempts: 0,
      askedQuestions: [],
      startTime: Date.now()
    };

    // Select 5 random questions
    const selectedQuestions = SECURITY_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 5);
    recoveryAttempts[sessionId].askedQuestions = selectedQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    res.json({
      success: true,
      message: 'Recovery questions loaded',
      sessionId: sessionId,
      questions: recoveryAttempts[sessionId].askedQuestions
    });
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /start-recovery
 * Start account recovery process - verify sequence after questions passed
 * Body: { sequence, sessionId }
 */
app.post('/start-recovery', async (req, res) => {
  const { sequence, sessionId } = req.body;

  if (!sequence || !sessionId) {
    return res.status(400).json({ error: 'Missing sequence or sessionId' });
  }

  try {
    // Check if session exists
    if (!recoveryAttempts[sessionId]) {
      return res.status(400).json({ error: 'Invalid recovery session' });
    }

    // Find user by sequence (verify against all users)
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error || !users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Find user with matching sequence
    let foundUser = null;
    for (const user of users) {
      const isValid = verifySequence(sequence, user.salt, user.password_hash);
      if (isValid) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    // Update session with userId
    recoveryAttempts[sessionId].userId = foundUser.id;

    res.json({
      success: true,
      message: 'Sequence verified',
      sessionId: sessionId
    });
  } catch (err) {
    console.error('Recovery start error:', err);
    res.status(500).json({ error: 'Failed to start recovery' });
  }
});

/**
 * POST /verify-recovery-answer
 * Verify a security question answer
 * Body: { sessionId, questionId, answer }
 */
app.post('/verify-recovery-answer', async (req, res) => {
  const { sessionId, questionId, answer } = req.body;

  if (!sessionId || !questionId || !answer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if recovery session exists
    if (!recoveryAttempts[sessionId]) {
      return res.status(400).json({ error: 'No active recovery session' });
    }

    const session = recoveryAttempts[sessionId];
    session.totalAttempts++;

    // Find the question
    const question = SECURITY_QUESTIONS.find(q => q.id === questionId);
    if (!question) {
      return res.status(400).json({ error: 'Invalid question' });
    }

    // Check if answer is correct (case-insensitive)
    const isCorrect = question.correctAnswer.toLowerCase() === answer.toLowerCase().trim();

    if (isCorrect) {
      session.correctAnswers++;
    }

    const attemptsRemaining = 5 - session.totalAttempts;
    const passed = session.correctAnswers >= 3;

    // If user passed or all attempts used
    if (passed || attemptsRemaining === 0) {
      const result = {
        success: true,
        passed: passed,
        correctAnswers: session.correctAnswers,
        totalAttempts: session.totalAttempts,
        message: passed 
          ? 'You passed! You can now reset your sequence.' 
          : 'You did not pass. Please try again later.'
      };

      if (passed) {
        // Generate a reset token
        result.resetToken = `reset_${session.userId}_${Date.now()}`;
      }

      // Clean up session
      delete recoveryAttempts[sessionId];

      return res.json(result);
    }

    res.json({
      success: true,
      isCorrect: isCorrect,
      correctAnswers: session.correctAnswers,
      totalAttempts: session.totalAttempts,
      attemptsRemaining: attemptsRemaining,
      message: isCorrect ? 'Correct! 🎉' : 'Incorrect. Try again!'
    });
  } catch (err) {
    console.error('Recovery verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * POST /reset-sequence
 * Reset user's sequence after successful recovery
 * Body: { resetToken, newSequence }
 */
app.post('/reset-sequence', async (req, res) => {
  const { resetToken, newSequence } = req.body;

  if (!resetToken || !newSequence) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (newSequence.length < 6) {
    return res.status(400).json({ error: 'Sequence must be at least 6 characters' });
  }

  try {
    // Extract userId from reset token
    const tokenParts = resetToken.split('_');
    if (tokenParts.length < 3 || tokenParts[0] !== 'reset') {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    const userId = tokenParts[1];

    // Generate new salt and hash
    const salt = generateSalt();
    const hashedSequence = hashSequence(newSequence, salt);

    // Update user's sequence
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: hashedSequence,
        salt: salt
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to reset sequence' });
    }

    res.json({
      success: true,
      message: 'Sequence reset successfully'
    });
  } catch (err) {
    console.error('Reset sequence error:', err);
    res.status(500).json({ error: 'Reset failed' });
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
