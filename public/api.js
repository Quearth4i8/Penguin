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
