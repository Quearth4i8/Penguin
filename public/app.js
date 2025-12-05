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
    this.detectOSAndShowPenguins();
  }

  /**
   * Detect OS and show/hide penguins accordingly
   */
  detectOSAndShowPenguins() {
    // Check for manual OS override from toggle
    const osToggle = document.getElementById('osToggle');
    const toggleValue = osToggle ? osToggle.value : 'auto';
    
    const userAgent = navigator.userAgent.toLowerCase();
    let detectedOS = 'Unknown OS';
    let isOpenSource = false;

    // If toggle is set to a specific OS, use that instead of auto-detect
    if (toggleValue !== 'auto') {
      if (toggleValue === 'linux') {
        detectedOS = 'Linux (Test Mode)';
        isOpenSource = true;
      } else if (toggleValue === 'windows') {
        detectedOS = 'Windows (Test Mode)';
        isOpenSource = false;
      } else if (toggleValue === 'macos') {
        detectedOS = 'macOS (Test Mode)';
        isOpenSource = false;
      }
    } else {
      // Auto-detect from user agent
      // Detect specific OS
      if (userAgent.includes('ubuntu')) {
        detectedOS = 'Ubuntu (Linux)';
        isOpenSource = true;
      } else if (userAgent.includes('debian')) {
        detectedOS = 'Debian (Linux)';
        isOpenSource = true;
      } else if (userAgent.includes('fedora')) {
        detectedOS = 'Fedora (Linux)';
        isOpenSource = true;
      } else if (userAgent.includes('arch')) {
        detectedOS = 'Arch Linux';
        isOpenSource = true;
      } else if (userAgent.includes('manjaro')) {
        detectedOS = 'Manjaro (Linux)';
        isOpenSource = true;
      } else if (userAgent.includes('opensuse')) {
        detectedOS = 'openSUSE (Linux)';
        isOpenSource = true;
      } else if (userAgent.includes('mint')) {
        detectedOS = 'Linux Mint';
        isOpenSource = true;
      } else if (userAgent.includes('centos')) {
        detectedOS = 'CentOS (Linux)';
        isOpenSource = true;
      } else if (userAgent.includes('freebsd')) {
        detectedOS = 'FreeBSD';
        isOpenSource = true;
      } else if (userAgent.includes('openbsd')) {
        detectedOS = 'OpenBSD';
        isOpenSource = true;
      } else if (userAgent.includes('netbsd')) {
        detectedOS = 'NetBSD';
        isOpenSource = true;
      } else if (userAgent.includes('linux')) {
        detectedOS = 'Linux (Generic)';
        isOpenSource = true;
      } else if (userAgent.includes('win')) {
        detectedOS = 'Windows';
      } else if (userAgent.includes('mac')) {
        detectedOS = 'macOS';
      } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        detectedOS = 'iOS';
      } else if (userAgent.includes('android')) {
        detectedOS = 'Android';
      }
    }

    console.log(`🖥️ Detected OS: ${detectedOS}`);
    console.log(`User Agent: ${navigator.userAgent}`);

    const penguins = document.querySelectorAll('.pushy-penguin');
    const notices = document.querySelector('.left-notices');
    
    if (isOpenSource) {
      // Hide penguins and notices if using open source OS
      penguins.forEach(penguin => {
        penguin.style.display = 'none';
      });
      if (notices) {
        notices.style.display = 'none';
      }
      console.log('✅ Open source OS detected! Penguins and notices hidden.');
    } else {
      // Show penguins and notices if using proprietary OS
      penguins.forEach(penguin => {
        penguin.style.display = 'flex';
      });
      if (notices) {
        notices.style.display = 'flex';
      }
      this.initPushyPenguin();
      console.log('⚠️ Proprietary OS detected! Penguins and notices activated to encourage open source.');
    }
  }

  /**
   * Initialize the pushy penguin mascots
   */
  initPushyPenguin() {
    const penguin1Messages = [
      'Use open source! 🐧',
      'Free software rocks! 💪',
      'Go FOSS! 🚀',
      'Open source > Closed! 🔓',
      'Share your code! 📤',
      'Linux forever! 🐧'
    ];

    const penguin2Messages = [
      'GPL is love 💕',
      'No proprietary here! ✋',
      'Community > Corporate 👥',
      'Transparency wins! 👁️',
      'Fork me on GitHub! 🍴',
      'Code should be free! 🦅'
    ];

    const penguin3Messages = [
      'Open = Better! ⭐',
      'Contribute now! 🤝',
      'Freedom in code! 🗽',
      'FOSS forever! 🔥',
      'Open minds, open code! 🧠',
      'Embrace the penguin! 🐧'
    ];

    // Penguin 1
    let index1 = 0;
    const msg1El = document.getElementById('penguinMessage1');
    setInterval(() => {
      index1 = (index1 + 1) % penguin1Messages.length;
      msg1El.textContent = penguin1Messages[index1];
    }, 5000);

    // Penguin 2
    let index2 = 0;
    const msg2El = document.getElementById('penguinMessage2');
    setInterval(() => {
      index2 = (index2 + 1) % penguin2Messages.length;
      msg2El.textContent = penguin2Messages[index2];
    }, 4500);

    // Penguin 3
    let index3 = 0;
    const msg3El = document.getElementById('penguinMessage3');
    setInterval(() => {
      index3 = (index3 + 1) % penguin3Messages.length;
      msg3El.textContent = penguin3Messages[index3];
    }, 5500);
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

    // OS Toggle for testing
    const osToggle = document.getElementById('osToggle');
    if (osToggle) {
      osToggle.addEventListener('change', () => {
        this.detectOSAndShowPenguins();
        // If game is running, update the OS detection in the game
        if (this.game) {
          this.game.isWindowsUser = this.game.detectOS();
        }
      });
    }

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
    this.startGame('🐧 Register');
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
