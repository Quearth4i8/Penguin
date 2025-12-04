/**
 * Main Application Controller
 * Manages screen transitions and game flow
 */

class PenguinLoginApp {
  constructor() {
    this.game = null;
    this.currentMode = null; // 'register' or 'login'
    this.userId = null;
    this.setupEventListeners();
    this.checkServerHealth();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Login screen
    document.getElementById('loginBtn').addEventListener('click', () => this.startLogin());
    document.getElementById('registerBtn').addEventListener('click', () => this.startRegister());

    // Game screen
    document.getElementById('backBtn').addEventListener('click', () => this.goBackToLogin());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearSequence());
    document.getElementById('submitBtn').addEventListener('click', () => this.submitSequence());

    // Success screen
    document.getElementById('successBtn').addEventListener('click', () => this.goBackToLogin());

    // Error screen
    document.getElementById('errorRetryBtn').addEventListener('click', () => this.goBackToLogin());

    // Allow Enter key on login screen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.currentMode === null) {
        this.startLogin();
      }
    });
  }

  /**
   * Check if server is running
   */
  async checkServerHealth() {
    try {
      await checkHealth();
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Server not running. Start with: node server.js');
      this.showError('Server Connection Failed', 'Please make sure the server is running on http://localhost:3000');
    }
  }

  /**
   * Start login mode
   */
  startLogin() {
    this.currentMode = 'login';
    this.clearLoginError();
    this.startGame('🐧 Login - Walk & Jump Your Way In');
  }

  /**
   * Start register mode
   */
  startRegister() {
    this.currentMode = 'register';
    this.clearLoginError();
    this.startGame('🐧 Register - Create Your Walking Pattern');
  }

  /**
   * Start the game
   */
  startGame(title) {
    // Switch to game screen
    this.switchScreen('gameScreen');
    document.getElementById('gameTitle').textContent = title;

    // Initialize game if not already done
    if (!this.game) {
      this.game = new PenguinGame('gameCanvas');
      this.game.onSequenceUpdated = (sequence) => this.updateSequenceDisplay(sequence);
      this.game.start();
    } else {
      this.game.reset();
    }

    this.updateSequenceDisplay(this.game.sequence);
    this.updateSubmitButton();
  }

  /**
   * Update sequence display
   */
  updateSequenceDisplay(sequence) {
    const display = document.getElementById('sequenceDisplay');
    display.innerHTML = '';

    sequence.forEach(item => {
      const dot = document.createElement('div');
      dot.className = `sequence-item ${item.toLowerCase()}`;
      dot.textContent = item;
      display.appendChild(dot);
    });

    this.updateSubmitButton();
  }

  /**
   * Update submit button state
   */
  updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const minLength = this.game.minSequenceLength;
    const currentLength = this.game.sequence.length;

    if (currentLength >= minLength) {
      submitBtn.disabled = false;
      submitBtn.textContent = `✓ Submit (${currentLength})`;
    } else {
      submitBtn.disabled = true;
      submitBtn.textContent = `Submit (${currentLength}/${minLength})`;
    }
  }

  /**
   * Clear sequence
   */
  clearSequence() {
    if (this.game) {
      this.game.clearSequence();
      this.updateSequenceDisplay(this.game.sequence);
      this.showGameMessage('Sequence cleared');
    }
  }

  /**
   * Submit sequence
   */
  async submitSequence() {
    if (!this.game || this.game.sequence.length < this.game.minSequenceLength) {
      this.showGameMessage('Sequence too short');
      return;
    }

    const sequence = this.game.getSequenceString();
    this.game.gameActive = false;

    try {
      if (this.currentMode === 'register') {
        await this.submitRegister(sequence);
      } else {
        await this.submitLogin(sequence);
      }
    } catch (error) {
      console.error('Submission error:', error);
      this.showGameMessage('Error: ' + error.message);
      this.game.gameActive = true;
    }
  }

  /**
   * Submit registration
   */
  async submitRegister(sequence) {
    try {
      // Generate a unique ID for this sequence
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const response = await registerUser(userId, sequence);
      
      // Store the userId so user can login with same sequence
      localStorage.setItem('penguinUserId', userId);
      
      this.showSuccess(
        'Account Created! 🎉',
        `Your sequence has been securely stored. You can now login with the same pattern!`
      );
    } catch (error) {
      this.showError('Registration Failed', error.message);
    }
  }

  /**
   * Submit login
   */
  async submitLogin(sequence) {
    try {
      // Try to login with stored userId or generate a new one
      let userId = localStorage.getItem('penguinUserId');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      
      const response = await loginUser(userId, sequence);
      this.showSuccess(
        'Login Successful! 🎉',
        `Welcome! Your sequence was verified.`
      );
    } catch (error) {
      const message = error.message;
      if (message.includes('Too many')) {
        this.showError('Too Many Attempts', 'You have exceeded the maximum login attempts. Please try again later.');
      } else {
        this.showError('Login Failed', 'The sequence you entered is incorrect. Try again.');
      }
    }
  }

  /**
   * Show success screen
   */
  showSuccess(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    this.switchScreen('successScreen');
  }

  /**
   * Show error screen
   */
  showError(title, message) {
    document.getElementById('errorScreen').querySelector('h2').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    this.switchScreen('errorScreen');
  }

  /**
   * Show game message (temporary notification)
   */
  showGameMessage(message) {
    const msgEl = document.getElementById('gameMessage');
    msgEl.textContent = message;
    msgEl.classList.add('show');

    setTimeout(() => {
      msgEl.classList.remove('show');
    }, 2000);
  }

  /**
   * Show login error
   */
  showLoginError(message) {
    document.getElementById('loginError').textContent = message;
  }

  /**
   * Clear login error
   */
  clearLoginError() {
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginAttempts').textContent = '';
  }

  /**
   * Switch between screens
   */
  switchScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Show target screen
    document.getElementById(screenId).classList.add('active');
  }

  /**
   * Go back to login screen
   */
  goBackToLogin() {
    if (this.game) {
      this.game.stop();
    }
    this.switchScreen('loginScreen');
    this.clearLoginError();
    this.userId = null;
    this.currentMode = null;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PenguinLoginApp();
});
