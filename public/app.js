/**
 * Main Application Controller
 * Manages screen transitions and game flow
 */

class PenguinLoginApp {
  constructor() {
    this.game = null;
    this.currentMode = null; // 'register' or 'login'
    this.userId = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.sequenceScreenshot = null;
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
    document.getElementById('forgotBtn').addEventListener('click', () => this.startRecovery());

    // Game screen
    document.getElementById('backBtn').addEventListener('click', () => this.goBackToLogin());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearSequence());
    document.getElementById('submitBtn').addEventListener('click', () => this.submitSequence());

    // Success screen
    document.getElementById('successBtn').addEventListener('click', () => this.goBackToLogin());

    // Error screen
    document.getElementById('errorRetryBtn').addEventListener('click', () => this.goBackToLogin());

    // Recovery screen
    document.getElementById('recoveryBackBtn').addEventListener('click', () => this.goBackToLogin());
    document.getElementById('recoverySubmitBtn').addEventListener('click', () => this.submitRecoveryAnswer());
    document.getElementById('recoveryAnswerInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !document.getElementById('recoverySubmitBtn').disabled) {
        this.submitRecoveryAnswer();
      }
    });


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
   * Start recording the game canvas
   */
  startRecording() {
    const canvas = document.getElementById('gameCanvas');
    
    try {
      const stream = canvas.captureStream(30); // 30 FPS
      this.recordedChunks = [];
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('🎥 Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      // Fallback for browsers that don't support vp9
      try {
        const stream = canvas.captureStream(30);
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        
        this.mediaRecorder.start();
        this.isRecording = true;
        console.log('🎥 Recording started (fallback codec)');
      } catch (fallbackError) {
        console.error('Recording not supported:', fallbackError);
      }
    }
  }

  /**
   * Stop recording and return blob
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.isRecording = false;
        console.log('🎥 Recording stopped');
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Capture screenshot of sequence display
   */
  captureSequenceScreenshot() {
    const sequenceDisplay = document.getElementById('sequenceDisplay');
    if (!sequenceDisplay) return null;

    // Create a temporary canvas for the screenshot
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 100;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Sequence Created:', 10, 25);
    
    // Draw sequence items
    const items = this.game.sequence;
    let xPos = 10;
    const yPos = 50;
    
    items.forEach((item, index) => {
      // Draw colored circle
      const colors = {
        'A': '#10b981',
        'B': '#ef4444',
        'C': '#f59e0b'
      };
      
      ctx.fillStyle = colors[item] || '#ccc';
      ctx.beginPath();
      ctx.arc(xPos + 15, yPos, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw letter
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item, xPos + 15, yPos);
      
      xPos += 35;
    });
    
    return canvas.toDataURL('image/png');
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
    
    // Start recording when game starts
    this.startRecording();
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
      } else if (this.currentMode === 'verifyRecoverySequence') {
        await this.submitVerifiedSequence(sequence);
      } else if (this.currentMode === 'reset') {
        await this.submitResetSequence(sequence);
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
      // Stop recording and capture screenshot
      const videoBlob = await this.stopRecording();
      const screenshotData = this.captureSequenceScreenshot();
      
      // Generate a unique ID for this sequence
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const response = await registerUser(userId, sequence);
      
      // Store the userId so user can login with same sequence
      localStorage.setItem('penguinUserId', userId);
      
      // Store recording and screenshot for download
      this.recordingBlob = videoBlob;
      this.screenshotData = screenshotData;
      
      this.showSuccess(
        'Account Created! 🎉',
        `Your sequence has been securely stored. You can now login with the same pattern!`,
        { videoBlob, screenshotData }
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
  showSuccess(title, message, mediaFiles = null) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    
    // Add download buttons if media files are provided
    const successContent = document.querySelector('.success-content');
    const existingButtons = successContent.querySelector('.media-download-buttons');
    if (existingButtons) {
      existingButtons.remove();
    }
    
    if (mediaFiles && (mediaFiles.videoBlob || mediaFiles.screenshotData)) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'media-download-buttons';
      buttonsContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin: 20px 0;';
      
      if (mediaFiles.screenshotData) {
        const screenshotBtn = document.createElement('button');
        screenshotBtn.className = 'btn btn-secondary';
        screenshotBtn.textContent = '📸 Download Screenshot';
        screenshotBtn.onclick = () => this.downloadScreenshot(mediaFiles.screenshotData);
        buttonsContainer.appendChild(screenshotBtn);
      }
      
      if (mediaFiles.videoBlob) {
        const videoBtn = document.createElement('button');
        videoBtn.className = 'btn btn-secondary';
        videoBtn.textContent = '🎥 Download Video';
        videoBtn.onclick = () => this.downloadVideo(mediaFiles.videoBlob);
        buttonsContainer.appendChild(videoBtn);
      }
      
      const successBtn = document.getElementById('successBtn');
      successBtn.parentNode.insertBefore(buttonsContainer, successBtn);
    }
    
    this.switchScreen('successScreen');
  }

  /**
   * Download screenshot
   */
  downloadScreenshot(screenshotData) {
    const link = document.createElement('a');
    link.href = screenshotData;
    link.download = `penguin-sequence-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download video
   */
  downloadVideo(videoBlob) {
    const url = URL.createObjectURL(videoBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `penguin-gameplay-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
   * Start recovery process - show questions first
   */
  async startRecovery() {
    this.currentMode = 'recovery';
    
    // Initialize recovery state with dummy session for questions
    this.recoveryState = {
      sessionId: null,
      questions: [],
      currentQuestionIndex: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      resetToken: null,
      stage: 'questions' // Track which stage we're in
    };

    // Get questions from backend
    try {
      // We need to get questions without verifying a sequence first
      // Create a temporary session just to get questions
      const response = await fetch('http://localhost:3000/get-recovery-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get questions');
      }

      this.recoveryState.sessionId = data.sessionId;
      this.recoveryState.questions = data.questions;

      this.switchScreen('recoveryScreen');
      this.initializeRecoveryChat();
    } catch (error) {
      this.showError('Recovery Failed', error.message);
    }
  }

  /**
   * Initialize recovery chat
   */
  initializeRecoveryChat() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = '';

    // Welcome message
    this.addChatMessage('bot', '🐧 Welcome to Account Recovery! Answer 3 out of 5 questions correctly to reset your sequence. Let\'s begin!');

    // Ask first question
    setTimeout(() => this.askNextQuestion(), 800);
  }

  /**
   * Ask next recovery question
   */
  askNextQuestion() {
    const { questions, currentQuestionIndex } = this.recoveryState;

    if (currentQuestionIndex >= questions.length) {
      return;
    }

    const question = questions[currentQuestionIndex];
    this.addChatMessage('bot', question.question);
    this.displayQuestionOptions(question);
  }

  /**
   * Display question options as buttons
   */
  displayQuestionOptions(question) {
    const chatContainer = document.getElementById('chatContainer');
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'question-options';

    question.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = option;
      btn.addEventListener('click', () => this.selectAnswer(option, question.id));
      optionsDiv.appendChild(btn);
    });

    chatContainer.appendChild(optionsDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Hide input area during question
    document.getElementById('recoveryAnswerInput').style.display = 'none';
    document.getElementById('recoverySubmitBtn').style.display = 'none';
  }

  /**
   * Add message to chat
   */
  addChatMessage(sender, message, type = null) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;
    if (type) bubble.classList.add(type);
    bubble.textContent = message;

    messageDiv.appendChild(bubble);
    chatContainer.appendChild(messageDiv);

    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  /**
   * Select an answer from multiple choice options
   */
  async selectAnswer(answer, questionId) {
    const { sessionId, questions, currentQuestionIndex } = this.recoveryState;
    const question = questions[currentQuestionIndex];

    // Add user message to chat
    this.addChatMessage('user', answer);

    // Remove option buttons
    const optionsDiv = document.querySelector('.question-options');
    if (optionsDiv) optionsDiv.remove();

    try {
      const response = await verifyRecoveryAnswer(sessionId, questionId, answer);

      this.recoveryState.correctAnswers = response.correctAnswers;
      this.recoveryState.totalAttempts = response.totalAttempts;

      // Update progress
      this.updateRecoveryProgress();

      // Show result with funny message
      const funnyMessages = {
        correct: [
          '🎉 Correct! You\'re a true penguin! 🐧',
          '✅ Nailed it! You\'re on fire! 🔥',
          '🌟 Brilliant! Keep it up!',
          '💪 That\'s right! You\'re crushing it!',
          '🚀 Correct! You\'re unstoppable!'
        ],
        incorrect: [
          '❌ Oops! Not quite... Try again!',
          '😅 Nope! Better luck next time!',
          '🤔 That\'s not it... Keep trying!',
          '🐧 Waddle back and try again!',
          '❌ Not this time, penguin! 🐧'
        ]
      };

      const messageList = response.isCorrect ? funnyMessages.correct : funnyMessages.incorrect;
      const randomMessage = messageList[Math.floor(Math.random() * messageList.length)];

      setTimeout(() => {
        this.addChatMessage('bot', randomMessage, response.isCorrect ? 'success' : 'error');

        // Check if recovery is complete
        if (response.passed !== undefined) {
          setTimeout(() => this.handleRecoveryComplete(response), 1000);
        } else {
          // Ask next question
          this.recoveryState.currentQuestionIndex++;
          const attemptsRemaining = response.attemptsRemaining;

          if (attemptsRemaining > 0) {
            setTimeout(() => {
              this.addChatMessage('bot', `You still have ${attemptsRemaining} ${attemptsRemaining === 1 ? 'try' : 'tries'} left! 💪`);
              setTimeout(() => this.askNextQuestion(), 600);
            }, 800);
          }
        }
      }, 600);
    } catch (error) {
      this.addChatMessage('bot', `Error: ${error.message}`, 'error');
    }
  }

  /**
   * Submit recovery answer (kept for backward compatibility)
   */
  async submitRecoveryAnswer() {
    // This is now handled by selectAnswer through button clicks
    // Keeping this method for event listener compatibility
  }

  /**
   * Update recovery progress bar
   */
  updateRecoveryProgress() {
    const { correctAnswers, totalAttempts } = this.recoveryState;
    const progressFill = document.getElementById('progressFill');
    const percentage = (correctAnswers / 3) * 100;
    progressFill.style.width = Math.min(percentage, 100) + '%';

    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('attemptCount').textContent = totalAttempts;
  }

  /**
   * Handle recovery completion
   */
  handleRecoveryComplete(response) {
    const chatContainer = document.getElementById('chatContainer');

    if (response.passed) {
      this.addChatMessage('bot', '🎉 Congratulations! You\'ve proven yourself! Now enter your original sequence to verify your account.', 'success');

      setTimeout(() => {
        // Disable input and show sequence entry screen
        document.getElementById('recoveryAnswerInput').disabled = true;
        document.getElementById('recoverySubmitBtn').disabled = true;

        setTimeout(() => {
          this.startSequenceVerification();
        }, 1500);
      }, 1000);
    } else {
      this.addChatMessage('bot', '😞 You didn\'t pass this time. Please try again later.', 'error');
      document.getElementById('recoveryAnswerInput').disabled = true;
      document.getElementById('recoverySubmitBtn').disabled = true;

      setTimeout(() => {
        this.goBackToLogin();
      }, 2000);
    }
  }

  /**
   * Start sequence verification after passing questions
   */
  startSequenceVerification() {
    this.currentMode = 'verifyRecoverySequence';
    this.switchScreen('gameScreen');
    document.getElementById('gameTitle').textContent = '🐧 Enter Your Original Sequence';

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
   * Submit verified sequence
   */
  async submitVerifiedSequence(sequence) {
    try {
      const response = await fetch('http://localhost:3000/start-recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sequence: sequence,
          sessionId: this.recoveryState.sessionId 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sequence verification failed');
      }

      // Sequence verified, now show reset sequence screen
      this.startResetSequence();
    } catch (error) {
      this.showError('Verification Failed', error.message);
      this.game.gameActive = true;
    }
  }

  /**
   * Verify recovery answer and check if passed
   */
  async verifyRecoveryAnswerAndCheck(sessionId, questionId, answer) {
    try {
      const response = await verifyRecoveryAnswer(sessionId, questionId, answer);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start reset sequence screen
   */
  startResetSequence() {
    this.currentMode = 'reset';
    this.switchScreen('gameScreen');
    document.getElementById('gameTitle').textContent = '🐧 Create Your New Sequence';

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
   * Submit reset sequence
   */
  async submitResetSequence(sequence) {
    try {
      const response = await resetSequence(this.recoveryState.resetToken, sequence);
      this.showSuccess(
        'Sequence Reset! 🎉',
        'Your new sequence has been saved. You can now login with your new pattern!'
      );
    } catch (error) {
      this.showError('Reset Failed', error.message);
      this.game.gameActive = true;
    }
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
    this.recoveryState = null;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PenguinLoginApp();
});
