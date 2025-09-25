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
    
    // Add debug button dynamically
    this.addDebugButton();
    
    // Modal buttons
    document.getElementById('nextLevelBtn')?.addEventListener('click', () => this.nextLevel());
    document.getElementById('retryBtn')?.addEventListener('click', () => this.resetLevel());
    document.getElementById('closeLevelsBtn')?.addEventListener('click', () => this.hideLevelSelect());
    
    // Install prompt
    document.getElementById('dismissInstallBtn')?.addEventListener('click', () => {
      document.getElementById('installPrompt')?.classList.add('hidden');
    });
  }

  addDebugButton() {
    // Check if debug button already exists
    if (document.getElementById('debugWinBtn')) return;
    
    // Find the controls container
    const controlsContainer = document.querySelector('.game-controls');
    if (!controlsContainer) {
      console.error('Could not find game-controls container');
      return;
    }
    
    // Create debug button
    const debugBtn = document.createElement('button');
    debugBtn.id = 'debugWinBtn';
    debugBtn.className = 'control-btn';
    debugBtn.style.background = 'orange';
    debugBtn.style.color = 'white';
    debugBtn.textContent = '🐛 Test Win';
    
    // Add click handler
    debugBtn.addEventListener('click', () => {
      console.log('🐛 Debug: Manually checking win condition');
      const isWin = this.checkWinCondition();
      console.log('🐛 Debug: Win condition result:', isWin);
      if (isWin) {
        console.log('🐛 Debug: Manually triggering level complete');
        this.handleLevelComplete();
      } else {
        console.log('🐛 Debug: Win condition not met');
      }
    });
    
    // Add to controls
    controlsContainer.appendChild(debugBtn);
    console.log('✅ Debug button added dynamically');
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
    console.log(`🖱️ Tube ${tubeId} clicked`);
    
    if (this.gameComplete) {
      console.log('❌ Game already complete, ignoring click');
      return;
    }
    
    const tube = this.currentGameState.tubes.find(t => t.id === tubeId);
    if (!tube) {
      console.error(`❌ Tube ${tubeId} not found`);
      return;
    }
    
    console.log(`📊 Clicked tube ${tubeId}: ${tube.balls.length} balls (capacity ${tube.capacity})`);
    
    // If no tube selected, select this tube (if it has balls)
    if (this.selectedTube === null) {
      console.log('🎯 No tube selected yet');
      if (tube.balls.length > 0) {
        console.log(`✅ Selecting tube ${tubeId} (has ${tube.balls.length} balls)`);
        this.selectTube(tubeId);
      } else {
        console.log(`❌ Cannot select empty tube ${tubeId}`);
        this.showInvalidMove(tubeId, 'Empty tube - nothing to move');
      }
      return;
    }
    
    console.log(`🎯 Currently selected tube: ${this.selectedTube}`);
    
    // If same tube clicked, deselect
    if (this.selectedTube === tubeId) {
      console.log('🔄 Same tube clicked, deselecting');
      this.deselectTube();
      return;
    }
    
    // Try to move ball from selected tube to this tube
    console.log(`🚀 Attempting move from ${this.selectedTube} to ${tubeId}`);
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
    console.log(`🔄 attemptMove called: from tube ${fromTubeId} to tube ${toTubeId}`);
    
    const fromTube = this.currentGameState.tubes.find(t => t.id === fromTubeId);
    const toTube = this.currentGameState.tubes.find(t => t.id === toTubeId);
    
    if (!fromTube || !toTube) {
      console.error('❌ Invalid tube IDs');
      return;
    }
    
    console.log(`📊 Before move - From tube: ${fromTube.balls.length} balls, To tube: ${toTube.balls.length} balls`);
    
    // Check if move is valid
    const moveResult = this.isValidMove(fromTube, toTube);
    if (!moveResult.valid) {
      console.log(`❌ Invalid move: ${moveResult.reason}`);
      this.showInvalidMove(toTubeId, moveResult.reason);
      return;
    }
    
    console.log('✅ Move is valid, performing move...');
    
    // Perform the move
    this.performMove(fromTube, toTube);
    
    console.log(`📊 After move - From tube: ${fromTube.balls.length} balls, To tube: ${toTube.balls.length} balls`);
    
    // Deselect
    this.deselectTube();
    
    // Update display
    this.updateLevelDisplay();
    this.renderGame();
    
    // Check win condition
    console.log('🏆 Calling checkWinCondition...');
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
    
    // Can't move to same tube
    if (fromTube.id === toTube.id) {
      return { valid: false, reason: 'Cannot move to same tube' };
    }
    
    // Check if destination has any space
    if (toTube.balls.length >= toTube.capacity) {
      return { valid: false, reason: 'Destination tube is full' };
    }
    
    // All moves are valid in liquid pouring puzzle (same color balls)
    // Even if not all balls can fit, we can move as many as possible
    return { valid: true };
  }

  /**
   * Perform a move - move all balls from source to destination
   */
  performMove(fromTube, toTube) {
    // Calculate how many balls we can move
    const ballsToMove = fromTube.balls.length;
    const availableSpace = toTube.capacity - toTube.balls.length;
    const actualBallsToMove = Math.min(ballsToMove, availableSpace);
    
    // Move all possible balls
    for (let i = 0; i < actualBallsToMove; i++) {
      const ball = fromTube.balls.pop();
      toTube.balls.push(ball);
    }
    
    // Increment move counter
    this.currentGameState.moves++;
    
    console.log(`Moved ${actualBallsToMove} balls from tube ${fromTube.id} to tube ${toTube.id}. Moves: ${this.currentGameState.moves}`);
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
   * Check win condition - each tube should have the desiredLevel number of balls
   */
  checkWinCondition() {
    console.log('🔍 Checking win condition...');
    
    // Get the desired number of balls per tube from level data
    const desiredLevel = this.currentGameState.desiredLevel || 2;
    console.log(`Target desiredLevel: ${desiredLevel}`);
    
    // Get current ball counts
    const ballCounts = this.currentGameState.tubes.map(tube => tube.balls.length);
    console.log(`Current ball counts: [${ballCounts.join(', ')}]`);
    
    // Check if all tubes have exactly the desired number of balls
    const allTubesAtDesiredLevel = this.currentGameState.tubes.every((tube, index) => {
      const hasCorrectCount = tube.balls.length === desiredLevel;
      console.log(`Tube ${index}: ${tube.balls.length} balls (need ${desiredLevel}) - ${hasCorrectCount ? '✅' : '❌'}`);
      return hasCorrectCount;
    });
    
    console.log(`All tubes at desired level: ${allTubesAtDesiredLevel}`);
    
    if (allTubesAtDesiredLevel) {
      console.log(`🎉 WIN CONDITION MET! Calling handleLevelComplete()...`);
      this.handleLevelComplete();
    } else {
      console.log(`❌ Win condition not met. Continue playing.`);
    }
  }

  /**
   * Handle level completion
   */
  handleLevelComplete() {
    console.log('🎉 handleLevelComplete() called!');
    this.gameComplete = true;
    
    // Calculate stars earned
    const moves = this.currentGameState.moves;
    const stars = this.currentGameState.stars;
    let starsEarned = 0;
    
    if (moves <= stars["3"]) starsEarned = 3;
    else if (moves <= stars["2"]) starsEarned = 2;
    else if (moves <= stars["1"]) starsEarned = 1;
    
    console.log(`Moves: ${moves}, Stars earned: ${starsEarned}`);
    
    // Update level manager
    this.levelManager.completeLevel(this.currentLevel, moves, starsEarned);
    
    // Show completion modal
    console.log('📱 Calling showLevelCompleteModal...');
    this.showLevelCompleteModal(starsEarned);
    
    console.log(`🎉 Level ${this.currentLevel} completed in ${moves} moves with ${starsEarned} stars!`);
    this.updateStatus(`Level complete! 🎉 ${starsEarned} stars earned!`);
  }

  /**
   * Show level complete modal
   */
  showLevelCompleteModal(stars) {
    console.log(`📱 showLevelCompleteModal called with ${stars} stars`);
    
    const modal = document.getElementById('levelCompleteModal');
    if (!modal) {
      console.error('❌ levelCompleteModal element not found!');
      return;
    }
    
    console.log('✅ Modal element found:', modal);
    
    // Update stars display
    const starElements = modal.querySelectorAll('.completion-stars .star');
    console.log(`Found ${starElements.length} star elements`);
    
    starElements.forEach((star, index) => {
      if (index < stars) {
        star.style.opacity = '1';
        console.log(`⭐ Star ${index + 1}: visible`);
      } else {
        star.style.opacity = '0.3';
        console.log(`⭐ Star ${index + 1}: dimmed`);
      }
    });
    
    // Update moves display
    const finalMoves = document.getElementById('finalMoves');
    if (finalMoves) {
      finalMoves.textContent = this.currentGameState.moves;
      console.log(`📊 Final moves display updated: ${this.currentGameState.moves}`);
    } else {
      console.error('❌ finalMoves element not found');
    }
    
    // Show/hide next level button
    const nextBtn = document.getElementById('nextLevelBtn');
    const nextLevel = this.levelManager.getNextLevel(this.currentLevel);
    if (nextBtn) {
      if (nextLevel) {
        nextBtn.style.display = 'inline-block';
        console.log('🔄 Next level button shown');
      } else {
        nextBtn.style.display = 'none';
        console.log('🔄 Next level button hidden (last level)');
      }
    } else {
      console.error('❌ nextLevelBtn element not found');
    }
    
    // Show the modal
    console.log('🎭 Removing "hidden" class from modal...');
    modal.classList.remove('hidden');
    
    // Verify modal is visible
    const isHidden = modal.classList.contains('hidden');
    console.log(`🎭 Modal hidden class status: ${isHidden ? 'STILL HIDDEN' : 'VISIBLE'}`);
    console.log(`🎭 Modal display style: ${window.getComputedStyle(modal).display}`);
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
