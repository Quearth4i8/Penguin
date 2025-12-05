/**
 * API client for communicating with the backend
 */

const API_BASE = 'http://localhost:3000';

/**
 * Register a new user with their sequence
 * @param {string} userId - Username
 * @param {string} sequence - Generated sequence (A/B/C characters)
 * @returns {Promise<Object>} Response from server
 */
async function registerUser(userId, sequence) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, sequence })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login with a user's sequence
 * @param {string} userId - Username
 * @param {string} sequence - Generated sequence (A/B/C characters)
 * @returns {Promise<Object>} Response from server
 */
async function loginUser(userId, sequence) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, sequence })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Check server health
 * @returns {Promise<Object>} Health status
 */
async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Start account recovery process
 * @param {string} sequence - User's sequence
 * @returns {Promise<Object>} Recovery session with questions and sessionId
 */
async function startRecovery(sequence) {
  try {
    const response = await fetch(`${API_BASE}/start-recovery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Recovery start failed');
    }

    return data;
  } catch (error) {
    console.error('Recovery start error:', error);
    throw error;
  }
}

/**
 * Verify a security question answer
 * @param {string} sessionId - Recovery session ID
 * @param {number} questionId - Question ID
 * @param {string} answer - User's answer
 * @returns {Promise<Object>} Verification result
 */
async function verifyRecoveryAnswer(sessionId, questionId, answer) {
  try {
    const response = await fetch(`${API_BASE}/verify-recovery-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, questionId, answer })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Verification failed');
    }

    return data;
  } catch (error) {
    console.error('Recovery verification error:', error);
    throw error;
  }
}

/**
 * Reset user's sequence after successful recovery
 * @param {string} resetToken - Reset token from recovery
 * @param {string} newSequence - New sequence
 * @returns {Promise<Object>} Reset result
 */
async function resetSequence(resetToken, newSequence) {
  try {
    const response = await fetch(`${API_BASE}/reset-sequence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetToken, newSequence })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Reset failed');
    }

    return data;
  } catch (error) {
    console.error('Reset sequence error:', error);
    throw error;
  }
}
