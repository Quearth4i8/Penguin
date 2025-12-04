const crypto = require('crypto');

/**
 * Generate a random salt for password hashing
 * @returns {string} Hex-encoded salt
 */
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash a sequence with a given salt using SHA-256
 * @param {string} sequence - The sequence string to hash
 * @param {string} salt - The salt to use
 * @returns {string} Hex-encoded hash
 */
function hashSequence(sequence, salt) {
  return crypto
    .createHmac('sha256', salt)
    .update(sequence)
    .digest('hex');
}

/**
 * Verify a sequence against a stored hash
 * @param {string} sequence - The sequence to verify
 * @param {string} salt - The salt used during hashing
 * @param {string} storedHash - The stored hash to compare against
 * @returns {boolean} True if sequence matches stored hash
 */
function verifySequence(sequence, salt, storedHash) {
  const computedHash = hashSequence(sequence, salt);
  return computedHash === storedHash;
}

module.exports = {
  generateSalt,
  hashSequence,
  verifySequence
};
