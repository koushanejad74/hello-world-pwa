/**
 * Ball Sort Puzzle Game
 * Main game logic and UI management
 */

class BallSortGame {
  constructor() {
    this.levelManager = null;
    this.currentGameState = null;
    this.selectedTube = null;
    this.gameComplete = false;
    this.currentLevel = 1;
    
    // UI Elements
    this.tubesContainer = null;
    this.moveCounter = null;
    this.currentLevelDisplay = null;
    this.targetMovesDisplay = null;
    this.statusDisplay = null;
    
    // Game settings
    this.animationDuration = 300;
    this.touchEnabled = 'ontouchstart' in window;
  }

  /**
   * Initialize the game
   */
  async init() {
    console.log('🎮 Initializing Ball Sort Puzzle...');
    
    // Initialize level manager
    this.levelManager = new LevelManager();
    const initialized = await this.levelManager.initialize();
    
    if (!initialized) {
      this.updateStatus('Failed to load levels 😞');
      return false;
    }
    
    // Get UI elements
    this.initializeUI();
    
    // Load saved progress
    this.levelManager.loadProgress();
    
    // Load first level
    await this.loadLevel(1);
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('✅ Game initialized successfully!');
    this.updateStatus('Game ready! Tap tubes to move balls 🎯');
    return true;
  }

  /**
   * Initialize UI elements
   */
  initializeUI() {
    this.tubesContainer = document.getElementById('tubesContainer');
    this.moveCounter = document.getElementById('moveCounter');
    this.currentLevelDisplay = document.getElementById('currentLevel');
    this.targetMovesDisplay = document.getElementById('targetMoves');
    this.statusDisplay = document.getElementById('status');
    
    // Ensure all elements exist
    if (!this.tubesContainer) {
      console.error('Missing tubesContainer element');
      return false;
    }
    
    return true;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Game control buttons
    document.getElementById('resetBtn')?.addEventListener('click', () => this.resetLevel());
    document.getElementById('hintBtn')?.addEventListener('click', () => this.showHint());
    document.getElementById('levelsBtn')?.addEventListener('click', () => this.showLevelSelect());
    
    // Modal buttons
    document.getElementById('nextLevelBtn')?.addEventListener('click', () => this.nextLevel());
    document.getElementById('retryBtn')?.addEventListener('click', () => this.resetLevel());
    document.getElementById('closeLevelsBtn')?.addEventListener('click', () => this.hideLevelSelect());
    
    // Install prompt
    document.getElementById('dismissInstallBtn')?.addEventListener('click', () => {
      document.getElementById('installPrompt')?.classList.add('hidden');
    });
  }

  /**
   * Load a specific level
   */
  async loadLevel(levelId) {
    try {
      console.log(`Loading level ${levelId}...`);
      
      const levelData = await this.levelManager.loadLevel(levelId);
      if (!levelData) {
        throw new Error(`Failed to load level ${levelId}`);
      }
      
      // Create game state
      this.currentGameState = this.levelManager.createGameLevel(levelData);
      this.currentLevel = levelId;
      this.gameComplete = false;
      this.selectedTube = null;
      
      // Update UI
      this.updateLevelDisplay();
      this.renderGame();
      
      console.log(`✅ Level ${levelId} loaded: ${levelData.name}`);
      this.updateStatus(`Level ${levelId} - Move balls between tubes! 🎯`);
      
    } catch (error) {
      console.error(`Failed to load level ${levelId}:`, error);
      this.updateStatus(`Failed to load level ${levelId} 😞`);
    }
  }

  /**
   * Update level display information
   */
  updateLevelDisplay() {
    if (!this.currentGameState) return;
    
    if (this.currentLevelDisplay) {
      this.currentLevelDisplay.textContent = `Level ${this.currentLevel}`;
    }
    
    if (this.moveCounter) {
      this.moveCounter.textContent = `Moves: ${this.currentGameState.moves}`;
    }
    
    if (this.targetMovesDisplay) {
      this.targetMovesDisplay.textContent = this.currentGameState.minMoves;
    }
    
    // Update stars based on current moves
    this.updateStars();
  }

  /**
   * Update star display
   */
  updateStars() {
    if (!this.currentGameState) return;
    
    const moves = this.currentGameState.moves;
    const stars = this.currentGameState.stars;
    
    for (let i = 1; i <= 3; i++) {
      const star = document.getElementById(`star${i}`);
      if (star) {
        if (moves <= stars[i.toString()]) {
          star.classList.add('earned');
        } else {
          star.classList.remove('earned');
        }
      }
    }
  }

  /**
   * Render the game board
   */
  renderGame() {
    if (!this.currentGameState || !this.tubesContainer) return;
    
    // Clear existing tubes
    this.tubesContainer.innerHTML = '';
    
    // Render each tube
    this.currentGameState.tubes.forEach((tube, index) => {
      const tubeElement = this.createTubeElement(tube, index);
      this.tubesContainer.appendChild(tubeElement);
    });
  }

  /**
   * Create a tube element
   */
  createTubeElement(tube, index) {
    const tubeDiv = document.createElement('div');
    tubeDiv.className = 'tube';
    tubeDiv.dataset.tubeId = tube.id;
    
    // Calculate tube height based on capacity
    const baseHeight = 100;
    const ballHeight = 47; // 45px ball + 2px margin
    const tubeHeight = baseHeight + (tube.capacity * ballHeight);
    tubeDiv.style.height = `${tubeHeight}px`;
    
    // Add capacity indicator
    const capacityDiv = document.createElement('div');
    capacityDiv.className = 'tube-capacity';
    capacityDiv.textContent = `${tube.balls.length}/${tube.capacity}`;
    tubeDiv.appendChild(capacityDiv);
    
    // Add tube ID
    const idDiv = document.createElement('div');
    idDiv.className = 'tube-id';
    idDiv.textContent = index + 1;
    tubeDiv.appendChild(idDiv);
    
    // Add balls
    tube.balls.forEach((ballColor, ballIndex) => {
      const ballDiv = document.createElement('div');
      ballDiv.className = `ball ${ballColor}`;
      ballDiv.textContent = ballIndex + 1; // Show ball number for debugging
      tubeDiv.appendChild(ballDiv);
    });
    
    // Add click/touch event listener
    tubeDiv.addEventListener('click', (e) => this.handleTubeClick(tube.id, e));
    if (this.touchEnabled) {
      tubeDiv.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleTubeClick(tube.id, e);
      });
    }
    
    return tubeDiv;
  }

  /**
   * Handle tube click/touch
   */
  handleTubeClick(tubeId, event) {
    if (this.gameComplete) return;
    
    const tube = this.currentGameState.tubes.find(t => t.id === tubeId);
    if (!tube) return;
    
    // If no tube selected, select this tube (if it has balls)
    if (this.selectedTube === null) {
      if (tube.balls.length > 0) {
        this.selectTube(tubeId);
      } else {
        this.showInvalidMove(tubeId, 'Empty tube - nothing to move');
      }
      return;
    }
    
    // If same tube clicked, deselect
    if (this.selectedTube === tubeId) {
      this.deselectTube();
      return;
    }
    
    // Try to move ball from selected tube to this tube
    this.attemptMove(this.selectedTube, tubeId);
  }

  /**
   * Select a tube
   */
  selectTube(tubeId) {
    this.selectedTube = tubeId;
    
    // Visual feedback
    const tubeElement = document.querySelector(`[data-tube-id="${tubeId}"]`);
    if (tubeElement) {
      tubeElement.classList.add('selected');
    }
    
    this.updateStatus('Tube selected! Tap another tube to move the ball 🎯');
  }

  /**
   * Deselect tube
   */
  deselectTube() {
    if (this.selectedTube !== null) {
      const tubeElement = document.querySelector(`[data-tube-id="${this.selectedTube}"]`);
      if (tubeElement) {
        tubeElement.classList.remove('selected');
      }
    }
    
    this.selectedTube = null;
    this.updateStatus('Selection cleared. Tap a tube with balls to start 🎯');
  }

  /**
   * Attempt to move a ball
   */
  attemptMove(fromTubeId, toTubeId) {
    const fromTube = this.currentGameState.tubes.find(t => t.id === fromTubeId);
    const toTube = this.currentGameState.tubes.find(t => t.id === toTubeId);
    
    if (!fromTube || !toTube) {
      console.error('Invalid tube IDs');
      return;
    }
    
    // Check if move is valid
    const moveResult = this.isValidMove(fromTube, toTube);
    if (!moveResult.valid) {
      this.showInvalidMove(toTubeId, moveResult.reason);
      return;
    }
    
    // Perform the move
    this.performMove(fromTube, toTube);
    
    // Deselect
    this.deselectTube();
    
    // Update display
    this.updateLevelDisplay();
    this.renderGame();
    
    // Check win condition
    this.checkWinCondition();
  }

  /**
   * Check if a move is valid
   */
  isValidMove(fromTube, toTube) {
    // Can't move from empty tube
    if (fromTube.balls.length === 0) {
      return { valid: false, reason: 'No balls to move' };
    }
    
    // Can't move to full tube
    if (toTube.balls.length >= toTube.capacity) {
      return { valid: false, reason: 'Tube is full' };
    }
    
    // All moves are valid in liquid pouring puzzle (same color balls)
    return { valid: true };
  }

  /**
   * Perform a move
   */
  performMove(fromTube, toTube) {
    // Move one ball
    const ball = fromTube.balls.pop();
    toTube.balls.push(ball);
    
    // Increment move counter
    this.currentGameState.moves++;
    
    console.log(`Moved ball from tube ${fromTube.id} to tube ${toTube.id}. Moves: ${this.currentGameState.moves}`);
  }

  /**
   * Show invalid move animation
   */
  showInvalidMove(tubeId, reason) {
    const tubeElement = document.querySelector(`[data-tube-id="${tubeId}"]`);
    if (tubeElement) {
      tubeElement.classList.add('invalid-move');
      setTimeout(() => {
        tubeElement.classList.remove('invalid-move');
      }, 300);
    }
    
    this.updateStatus(`Invalid move: ${reason} ❌`);
    
    // Auto-clear status after 2 seconds
    setTimeout(() => {
      if (this.selectedTube !== null) {
        this.updateStatus('Tube selected! Tap another tube to move the ball 🎯');
      } else {
        this.updateStatus('Tap a tube with balls to start 🎯');
      }
    }, 2000);
  }

  /**
   * Check win condition - this needs to be adapted for your puzzle type
   */
  checkWinCondition() {
    // For liquid pouring puzzle, we need to check if we've achieved the desired distribution
    // This is a simplified check - you might need to adapt this based on your specific win conditions
    
    // For now, let's check if we've used the minimum number of moves and achieved some goal
    // You'll need to define what "winning" means for your puzzle type
    
    // Placeholder win condition - adapt this based on your puzzle rules
    const hasEmptyTubes = this.currentGameState.tubes.some(tube => tube.balls.length === 0);
    const hasFullTubes = this.currentGameState.tubes.some(tube => tube.balls.length === tube.capacity);
    
    // This is a very basic win condition - you should replace this with your actual win logic
    if (this.currentGameState.moves >= this.currentGameState.minMoves && hasEmptyTubes && hasFullTubes) {
      this.handleLevelComplete();
    }
  }

  /**
   * Handle level completion
   */
  handleLevelComplete() {
    this.gameComplete = true;
    
    // Calculate stars earned
    const moves = this.currentGameState.moves;
    const stars = this.currentGameState.stars;
    let starsEarned = 0;
    
    if (moves <= stars["3"]) starsEarned = 3;
    else if (moves <= stars["2"]) starsEarned = 2;
    else if (moves <= stars["1"]) starsEarned = 1;
    
    // Update level manager
    this.levelManager.completeLevel(this.currentLevel, moves, starsEarned);
    
    // Show completion modal
    this.showLevelCompleteModal(starsEarned);
    
    console.log(`🎉 Level ${this.currentLevel} completed in ${moves} moves with ${starsEarned} stars!`);
    this.updateStatus(`Level complete! 🎉 ${starsEarned} stars earned!`);
  }

  /**
   * Show level complete modal
   */
  showLevelCompleteModal(stars) {
    const modal = document.getElementById('levelCompleteModal');
    if (!modal) return;
    
    // Update stars display
    const starElements = modal.querySelectorAll('.completion-stars .star');
    starElements.forEach((star, index) => {
      if (index < stars) {
        star.style.opacity = '1';
      } else {
        star.style.opacity = '0.3';
      }
    });
    
    // Update moves display
    const finalMoves = document.getElementById('finalMoves');
    if (finalMoves) {
      finalMoves.textContent = this.currentGameState.moves;
    }
    
    // Show/hide next level button
    const nextBtn = document.getElementById('nextLevelBtn');
    const nextLevel = this.levelManager.getNextLevel(this.currentLevel);
    if (nextBtn) {
      if (nextLevel) {
        nextBtn.style.display = 'inline-block';
      } else {
        nextBtn.style.display = 'none';
      }
    }
    
    modal.classList.remove('hidden');
  }

  /**
   * Reset current level
   */
  async resetLevel() {
    if (!this.currentLevel) return;
    
    await this.loadLevel(this.currentLevel);
    this.updateStatus('Level reset! 🔄');
  }

  /**
   * Load next level
   */
  async nextLevel() {
    const nextLevel = this.levelManager.getNextLevel(this.currentLevel);
    if (nextLevel) {
      document.getElementById('levelCompleteModal')?.classList.add('hidden');
      await this.loadLevel(nextLevel.id);
    }
  }

  /**
   * Show hint
   */
  showHint() {
    if (!this.currentGameState || !this.currentGameState.solutionSteps) {
      this.updateStatus('No hint available for this level 🤔');
      return;
    }
    
    const currentMoveIndex = this.currentGameState.moves;
    const solution = this.currentGameState.solutionSteps;
    
    if (currentMoveIndex < solution.length) {
      const nextMove = solution[currentMoveIndex];
      const fromTube = nextMove[0];
      const toTube = nextMove[1];
      
      this.updateStatus(`💡 Hint: Move from tube ${fromTube} to tube ${toTube}`);
    } else {
      this.updateStatus('No more hints available! 🎯');
    }
  }

  /**
   * Show level selection
   */
  showLevelSelect() {
    const modal = document.getElementById('levelSelectModal');
    const grid = document.getElementById('levelGrid');
    if (!modal || !grid) return;
    
    // Clear existing buttons
    grid.innerHTML = '';
    
    // Create level buttons
    const levels = this.levelManager.getAllLevels();
    levels.forEach(level => {
      const button = document.createElement('button');
      button.className = 'level-btn';
      button.textContent = level.id;
      
      if (level.completed) {
        button.classList.add('completed');
        const starsDiv = document.createElement('div');
        starsDiv.className = 'level-stars';
        starsDiv.textContent = '★'.repeat(level.stars);
        button.appendChild(starsDiv);
      } else if (level.unlocked) {
        button.classList.add('unlocked');
      }
      
      if (level.unlocked) {
        button.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.loadLevel(level.id);
        });
      }
      
      grid.appendChild(button);
    });
    
    modal.classList.remove('hidden');
  }

  /**
   * Hide level selection
   */
  hideLevelSelect() {
    document.getElementById('levelSelectModal')?.classList.add('hidden');
  }

  /**
   * Update status message
   */
  updateStatus(message) {
    if (this.statusDisplay) {
      this.statusDisplay.textContent = message;
    }
    console.log(`Status: ${message}`);
  }
}

// Initialize game when DOM is loaded
let game = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Starting Ball Sort Puzzle...');
  
  game = new BallSortGame();
  const initialized = await game.init();
  
  if (!initialized) {
    console.error('❌ Failed to initialize game');
  }
});

// Export for debugging
window.game = game;
