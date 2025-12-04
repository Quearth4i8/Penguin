class PenguinGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas to fill entire screen
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Game state
    this.sequence = [];
    this.gameActive = true;
    this.maxSequenceLength = 8;
    this.minSequenceLength = 6;
    this.gameSpeed = 2.5;

    // Paths
    this.paths = [
      { x: this.width * 0.25, label: 'Left' },
      { x: this.width * 0.5, label: 'Center' },
      { x: this.width * 0.75, label: 'Right' }
    ];
    this.pathWidth = 60;

    // Penguin state
    this.penguin = {
      x: this.paths[1].x,
      y: this.height - 60,
      width: 100,
      height: 120,
      velocityY: 0,
      gravity: 0.6,
      isJumping: false,
      jumpPower: 14,
      jumpCooldown: false,
      currentPathIndex: 1,
      targetPathIndex: 1,
      rotation: 0,
      scale: 1,
      moveSpeed: 8, // Speed for horizontal movement
      isMoving: false
    };

    // Obstacles
    this.obstacles = [];
    this.generateObstacles();

    // Camera
    this.cameraY = 0;

    // Visual effects
    this.particles = [];
    this.stars = this.generateStars();
    this.animationFrame = 0;

    // Load images
    this.boxImage = new Image();
    this.boxImage.src = 'box.png';
    this.iceImage = new Image();
    this.iceImage.src = 'ice.png';
    this.penguinImage = new Image();
    this.penguinImage.src = 'penguin.png';
    
    // Add error handling
    this.boxImage.onerror = () => console.log('Box image failed to load');
    this.iceImage.onerror = () => console.log('Ice image failed to load');
    this.penguinImage.onerror = () => console.log('Penguin image failed to load');
    this.boxImage.onload = () => console.log('Box image loaded successfully');
    this.iceImage.onload = () => console.log('Ice image loaded successfully');
    this.penguinImage.onload = () => console.log('Penguin image loaded successfully');

    // Event listeners
    this.setupEventListeners();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  generateStars() {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 1,
        brightness: Math.random()
      });
    }
    return stars;
  }

  createParticles(x, y, type) {
    const colors = {
      A: ['#10b981', '#34d399'], // Green for jump
      B: ['#ef4444', '#f87171'], // Red for bump
      C: ['#3b82f6', '#60a5fa']  // Blue for clear
    };
    
    const particleColors = colors[type] || ['#ffffff'];
    
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        size: Math.random() * 4 + 2
      });
    }
  }

  generateObstacles() {
    this.obstacles = [];
    const spacing = 750;
    const obstacleCount = 50;

    // Fixed pattern for obstacles to ensure consistency between registration and login
    const patterns = [
      // Pattern 1: Single obstacle on left
      [{ pathIndex: 0, type: 0 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 2 }],
      // Pattern 2: Single obstacle on center  
      [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 0 }, { pathIndex: 2, type: 2 }],
      // Pattern 3: Single obstacle on right
      [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 0 }],
      // Pattern 4: Two obstacles (left and center)
      [{ pathIndex: 0, type: 0 }, { pathIndex: 1, type: 0 }, { pathIndex: 2, type: 2 }],
      // Pattern 5: Two obstacles (center and right)
      [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 0 }, { pathIndex: 2, type: 0 }],
      // Pattern 6: All clear (for variety)
      [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 2 }],
      // Pattern 7: Obstacles on left and right
      [{ pathIndex: 0, type: 0 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 0 }]
    ];

    for (let i = 0; i < obstacleCount; i++) {
      const y = this.height - 60 - 300 - i * spacing;
      
      // Use fixed pattern based on index to ensure reproducibility
      const patternIndex = i % patterns.length;
      const pattern = patterns[patternIndex];

      pattern.forEach(pathConfig => {
        const { pathIndex, type } = pathConfig;
        let width = 0, height = 0;
        if (type === 0) { 
          width = 50 + Math.random() * 20; 
          height = 40 + Math.random() * 20; 
        } else if (type === 2) { 
          width = 0; 
          height = 0; 
        }

        this.obstacles.push({
          y,
          pathIndex,
          type,
          width,
          height,
          processed: false,
          outcome: ['B', 'A', 'C'][type]
        });
      });
    }
  }

  generateMoreObstacles() {
    // Generate obstacles ahead of the camera
    const highestObstacle = Math.min(...this.obstacles.map(o => o.y));
    const cameraTop = this.cameraY - 100;
    
    if (highestObstacle > cameraTop) {
      const spacing = 750;
      const startY = highestObstacle - spacing;
      const obstacleCount = 10;

      // Same fixed patterns for consistency
      const patterns = [
        [{ pathIndex: 0, type: 0 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 2 }],
        [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 0 }, { pathIndex: 2, type: 2 }],
        [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 0 }],
        [{ pathIndex: 0, type: 0 }, { pathIndex: 1, type: 0 }, { pathIndex: 2, type: 2 }],
        [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 0 }, { pathIndex: 2, type: 0 }],
        [{ pathIndex: 0, type: 2 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 2 }],
        [{ pathIndex: 0, type: 0 }, { pathIndex: 1, type: 2 }, { pathIndex: 2, type: 0 }]
      ];

      for (let i = 0; i < obstacleCount; i++) {
        const y = startY - i * spacing;
        
        // Continue pattern based on existing obstacles count
        const patternIndex = (this.obstacles.length / 3 + i) % patterns.length;
        const pattern = patterns[patternIndex];

        pattern.forEach(pathConfig => {
          const { pathIndex, type } = pathConfig;
          let width = 0, height = 0;
          if (type === 0) { 
            width = 50 + Math.random() * 20; 
            height = 40 + Math.random() * 20; 
          } else if (type === 2) { 
            width = 0; 
            height = 0; 
          }

          this.obstacles.push({
            y,
            pathIndex,
            type,
            width,
            height,
            processed: false,
            outcome: ['B', 'A', 'C'][type]
          });
        });
      }
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', e => this.handleKeyPress(e));
    this.canvas.addEventListener('click', () => this.handleJump());
  }

  handleKeyPress(event) {
    if (!this.gameActive) return;
    if (event.key === 'ArrowLeft' || event.key === 'a') this.togglePath('left');
    else if (event.key === 'ArrowRight' || event.key === 'd') this.togglePath('right');
    else if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w') this.handleJump();
  }

  togglePath(direction) {
    const current = this.penguin.currentPathIndex;
    let newPath;
    
    if (direction === 'left') {
      if (current === 1) newPath = 0; // center -> left
      else if (current === 0) newPath = 1; // left -> center  
      else if (current === 2) newPath = 1; // right -> center
    } else if (direction === 'right') {
      if (current === 1) newPath = 2; // center -> right
      else if (current === 2) newPath = 1; // right -> center
      else if (current === 0) newPath = 1; // left -> center
    }
    
    this.switchPath(newPath);
  }

  switchPath(pathIndex) {
    if (pathIndex < 0 || pathIndex > 2) return;
    if (pathIndex === this.penguin.currentPathIndex) return; // Already on this path
    this.penguin.targetPathIndex = pathIndex;
    this.penguin.isMoving = true;
  }


  handleJump() {
    // Only allow jump if not already jumping and not on cooldown
    if (!this.penguin.isJumping && !this.penguin.jumpCooldown) {
      this.penguin.isJumping = true;
      this.penguin.velocityY = -this.penguin.jumpPower;
      
      // Set cooldown to prevent immediate re-jump
      this.penguin.jumpCooldown = true;
      setTimeout(() => {
        this.penguin.jumpCooldown = false;
      }, 300);
    }
  }

  update() {
    if (!this.gameActive) return;

    // Auto-walk upward
    this.penguin.y -= this.gameSpeed;

    // Handle vertical movement (jumping)
    if (this.penguin.isJumping) {
      this.penguin.velocityY += this.penguin.gravity;
      this.penguin.y += this.penguin.velocityY;

      // Check landing (when falling back down)
      if (this.penguin.velocityY > 0) {
        // Don't force landing - let gravity and upward movement handle it naturally
        // Jump ends when velocity becomes positive and penguin starts falling
        if (this.penguin.velocityY > 8) {
          this.penguin.isJumping = false;
        }
      }
    }

    // Handle horizontal movement (smooth animated movement)
    if (this.penguin.isMoving) {
      const targetX = this.paths[this.penguin.targetPathIndex].x;
      const dx = targetX - this.penguin.x;
      
      if (Math.abs(dx) > this.penguin.moveSpeed) {
        // Move towards target
        this.penguin.x += Math.sign(dx) * this.penguin.moveSpeed;
      } else {
        // Reached target
        this.penguin.x = targetX;
        this.penguin.currentPathIndex = this.penguin.targetPathIndex;
        this.penguin.isMoving = false;
      }
    }

    // Update camera
    this.cameraY = this.penguin.y - this.height / 3;

    // Generate more obstacles as needed
    this.generateMoreObstacles();

    // Check collisions
    this.checkObstacleCollision();

    // Clean up obstacles
    this.obstacles = this.obstacles.filter(o => o.y > this.cameraY - 200);

    // Update particles
    this.updateParticles();

    // Update animation frame
    this.animationFrame++;

    // Update penguin animation
    this.updatePenguinAnimation();
  }


  checkObstacleCollision() {
    const penguinTop = this.penguin.y - this.penguin.height/2;
    const penguinBottom = this.penguin.y + this.penguin.height/2;
    const pathX = this.paths[this.penguin.currentPathIndex].x;

    this.obstacles.forEach(obs => {
      if (obs.processed) return;
      if (obs.pathIndex !== this.penguin.currentPathIndex) return;

      const obsTop = obs.y;
      const obsBottom = obs.y + obs.height;

      // Only check collision when penguin is near the obstacle
      if (Math.abs(penguinBottom - obsTop) < 50) {
        // Check if penguin is at the obstacle's Y position (collision)
        if (penguinBottom >= obsTop && penguinTop <= obsBottom) {
          if (obs.type === 0) { // obstacle
            // Check if penguin is jumping to clear it
            if (this.penguin.isJumping) {
              this.addToSequence('A'); // Jumped over
            } else {
              this.addToSequence('B'); // Bumped into
            }
          } else { // clear path
            this.addToSequence('C'); // Clear path
          }
          obs.processed = true;
        }
        // Check if penguin has passed the obstacle without interaction
        else if (penguinTop > obsBottom) {
          this.addToSequence('C'); // Passed without interaction
          obs.processed = true;
        }
      }
    });
  }

  addToSequence(outcome) {
    if (this.sequence.length < this.maxSequenceLength) {
      this.sequence.push(outcome);
      this.onSequenceUpdated?.(this.sequence);
      
      // Create particle effect at penguin position
      const pathX = this.paths[this.penguin.currentPathIndex].x;
      this.createParticles(pathX, this.penguin.y, outcome);

      if (this.sequence.length >= this.minSequenceLength) {
        this.gameActive = false;
        // Stop penguin movement at last obstacle
        this.penguin.y -= this.gameSpeed; // Move to obstacle position
        this.onSequenceComplete?.(this.getSequenceString());
      }
    }
  }

  getSequenceString() {
    return this.sequence.join('');
  }

  clearSequence() {
    this.sequence = [];
    this.gameActive = true;
    this.penguin.y = this.height - 60;
    this.penguin.x = this.paths[1].x;
    this.penguin.velocityY = 0;
    this.penguin.isJumping = false;
    this.penguin.currentPathIndex = 1;
    this.penguin.targetPathIndex = 1;
    this.cameraY = 0;
    this.particles = []; // Clear particles too
    this.generateObstacles();
    this.onSequenceUpdated?.(this.sequence);
  }

  stop() {
    this.gameActive = false;
  }

  updateParticles() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.life -= 0.02;
      return particle.life > 0;
    });
  }

  updatePenguinAnimation() {
    // Enhanced rotation when switching paths
    if (this.penguin.isMoving) {
      this.penguin.rotation = Math.sin(this.animationFrame * 0.3) * 0.15;
    } else {
      this.penguin.rotation *= 0.85; // dampen rotation when not moving
    }

    // Gentle scale animation
    this.penguin.scale = 1 + Math.sin(this.animationFrame * 0.05) * 0.05;
    
    // Add slight horizontal squish when moving
    if (this.penguin.isMoving) {
      this.penguin.scale = 1 + Math.sin(this.animationFrame * 0.2) * 0.08;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.width,this.height);

    // Draw animated background
    this.drawBackground();

    // Draw stars
    this.drawStars();

    this.drawPaths();
    this.drawObstacles();
    this.drawPenguin();
    this.drawParticles();
  }

  drawBackground() {
    const ctx = this.ctx;
    
    // Simple gradient background
    const grad = ctx.createLinearGradient(0,0,0,this.height);
    grad.addColorStop(0,'#4f46e5');
    grad.addColorStop(1,'#7c3aed');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,this.width,this.height);
  }

  drawStars() {
    // Remove stars for cleaner look
  }

  drawParticles() {
    const ctx = this.ctx;
    this.particles.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y - this.cameraY + this.height/3, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  drawPaths() {
    const ctx = this.ctx;
    this.paths.forEach((path,index)=>{
      const left = path.x - this.pathWidth/2;
      const right = path.x + this.pathWidth/2;
      
      // Glowing path lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.setLineDash([10, 5]);
      ctx.beginPath(); ctx.moveTo(left,0); ctx.lineTo(left,this.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(right,0); ctx.lineTo(right,this.height); ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });
  }

  drawObstacles() {
    const ctx = this.ctx;
    this.obstacles.forEach(obs=>{
      const y = obs.y - this.cameraY + this.height/3;
      const x = this.paths[obs.pathIndex].x;
      if (y < -50 || y > this.height+50) return;

      if (obs.type===0){ // obstacle - use box.png
        if (this.boxImage.complete && this.boxImage.naturalWidth > 0) {
          ctx.save();
          ctx.translate(x, y + obs.height/2);
          ctx.rotate(Math.sin(this.animationFrame * 0.02) * 0.05);
          ctx.drawImage(this.boxImage, -obs.width/2, -obs.height/2, obs.width, obs.height);
          ctx.restore();
        } else {
          // Fallback rectangle with glow
          ctx.fillStyle='#ef4444';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ef4444';
          ctx.fillRect(x-obs.width/2, y, obs.width, obs.height);
          ctx.shadowBlur = 0;
        }
      }
      // Removed ice gap handling - only boxes and clear paths
    });
  }

  drawPenguin() {
    const p = this.penguin;
    const ctx = this.ctx;
    const y = p.y - this.cameraY + this.height/3;

    ctx.save();
    ctx.translate(p.x, y);
    
    // Use penguin.png if loaded, otherwise fallback to drawn penguin
    if (this.penguinImage.complete && this.penguinImage.naturalWidth > 0) {
      // Scale the image to fit the penguin dimensions
      const scale = Math.max(p.width / this.penguinImage.naturalWidth, p.height / this.penguinImage.naturalHeight);
      const scaledWidth = this.penguinImage.naturalWidth * scale;
      const scaledHeight = this.penguinImage.naturalHeight * scale;
      
      // Add gentle animation
      const wiggle = Math.sin(this.animationFrame * 0.15) * 0.05;
      ctx.rotate(wiggle);
      
      // Draw the penguin image centered
      ctx.drawImage(this.penguinImage, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
    } else {
      // Fallback to drawn penguin if image not loaded
      // Body
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.width/2, p.height/2, 0, 0, Math.PI*2);
      ctx.fill();

      // White belly
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 5, p.width/3, p.height/3, 0, 0, Math.PI*2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(0, -p.height/3, p.width/2.5, 0, Math.PI*2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-4, -p.height/3, 3, 0, Math.PI*2);
      ctx.arc(4, -p.height/3, 3, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(-4, -p.height/3, 1.5, 0, Math.PI*2);
      ctx.arc(4, -p.height/3, 1.5, 0, Math.PI*2);
      ctx.fill();

      // Orange beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(0, -p.height/3 + 6);
      ctx.lineTo(-4, -p.height/3 + 10);
      ctx.lineTo(4, -p.height/3 + 10);
      ctx.closePath();
      ctx.fill();

      // Animated wiggling wings
      const wiggle = Math.sin(this.animationFrame * 0.15) * 0.3;
      ctx.fillStyle = '#1f2937';
      
      // Left wing
      ctx.save();
      ctx.rotate(-wiggle);
      ctx.beginPath();
      ctx.ellipse(-p.width/2 - 3, 3, 6, 12, -0.2, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      
      // Right wing
      ctx.save();
      ctx.rotate(wiggle);
      ctx.beginPath();
      ctx.ellipse(p.width/2 + 3, 3, 6, 12, 0.2, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  start() {
    const loop = ()=>{
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    loop();
  }
}
