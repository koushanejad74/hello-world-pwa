/**
 * Ball Sort Puzzle - Level Manager
 * Handles loading, validation, and management of game levels
 */

class LevelManager {
  constructor() {
    this.currentLevel = null;
    this.levelIndex = null;
    this.levelsCache = new Map();
  }

  /**
   * Initialize the level manager by loading the level index
   */
  async initialize() {
    try {
      const response = await fetch('./levels/levels-index.json');
      if (!response.ok) {
        throw new Error(`Failed to load level index: ${response.status}`);
      }
      this.levelIndex = await response.json();
      console.log(`Loaded ${this.levelIndex.totalLevels} levels`);
      return true;
    } catch (error) {
      console.error('Failed to initialize level manager:', error);
      return false;
    }
  }

  /**
   * Load a specific level by ID
   */
  async loadLevel(levelId) {
    try {
      // Check if level exists in index
      const levelInfo = this.levelIndex.levels.find(l => l.id === levelId);
      if (!levelInfo) {
        throw new Error(`Level ${levelId} not found in index`);
      }

      // Check cache first
      if (this.levelsCache.has(levelId)) {
        this.currentLevel = this.levelsCache.get(levelId);
        return this.currentLevel;
      }

      // Load level from file
      const response = await fetch(`./levels/${levelInfo.file}`);
      if (!response.ok) {
        throw new Error(`Failed to load level file: ${response.status}`);
      }
      
      const levelData = await response.json();
      
      // Validate level data
      if (!this.validateLevel(levelData)) {
        throw new Error(`Invalid level data for level ${levelId}`);
      }

      // Cache and set as current level
      this.levelsCache.set(levelId, levelData);
      this.currentLevel = levelData;
      
      console.log(`Loaded level ${levelId}: ${levelData.name}`);
      return levelData;
      
    } catch (error) {
      console.error(`Failed to load level ${levelId}:`, error);
      throw error;
    }
  }

  /**
   * Validate level data structure
   */
  validateLevel(levelData) {
    if (!levelData || typeof levelData !== 'object') return false;
    if (!levelData.levelId || !levelData.tubes || !Array.isArray(levelData.tubes)) return false;
    if (!levelData.colors || !Array.isArray(levelData.colors)) return false;

    // Validate tubes
    for (const tube of levelData.tubes) {
      if (!tube.hasOwnProperty('id') || !Array.isArray(tube.balls)) return false;
      if (typeof tube.capacity !== 'number' || tube.capacity < 1) return false;
      
      // Validate balls are valid colors
      for (const ball of tube.balls) {
        if (!levelData.colors.includes(ball)) return false;
      }
    }

    return true;
  }

  /**
   * Get all levels info
   */
  getAllLevels() {
    return this.levelIndex ? this.levelIndex.levels : [];
  }

  /**
   * Get levels by difficulty
   */
  getLevelsByDifficulty(difficulty) {
    if (!this.levelIndex || !this.levelIndex.difficulties[difficulty]) return [];
    const levelIds = this.levelIndex.difficulties[difficulty].levels;
    return this.levelIndex.levels.filter(level => levelIds.includes(level.id));
  }

  /**
   * Get next available level
   */
  getNextLevel(currentLevelId) {
    if (!this.levelIndex) return null;
    const currentIndex = this.levelIndex.levels.findIndex(l => l.id === currentLevelId);
    if (currentIndex >= 0 && currentIndex < this.levelIndex.levels.length - 1) {
      return this.levelIndex.levels[currentIndex + 1];
    }
    return null;
  }

  /**
   * Get previous level
   */
  getPreviousLevel(currentLevelId) {
    if (!this.levelIndex) return null;
    const currentIndex = this.levelIndex.levels.findIndex(l => l.id === currentLevelId);
    if (currentIndex > 0) {
      return this.levelIndex.levels[currentIndex - 1];
    }
    return null;
  }

  /**
   * Mark level as completed
   */
  completeLevel(levelId, moves, stars) {
    if (!this.levelIndex) return;
    
    const levelInfo = this.levelIndex.levels.find(l => l.id === levelId);
    if (levelInfo) {
      levelInfo.completed = true;
      levelInfo.stars = Math.max(levelInfo.stars, stars);
      levelInfo.bestMoves = levelInfo.bestMoves ? Math.min(levelInfo.bestMoves, moves) : moves;
      
      // Unlock next level
      const nextLevel = this.getNextLevel(levelId);
      if (nextLevel) {
        nextLevel.unlocked = true;
      }
      
      // Save progress
      this.saveProgress();
    }
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    if (!this.levelIndex) return;
    
    const progress = {
      version: this.levelIndex.version,
      levels: this.levelIndex.levels.map(level => ({
        id: level.id,
        unlocked: level.unlocked,
        completed: level.completed,
        stars: level.stars,
        bestMoves: level.bestMoves
      }))
    };
    
    localStorage.setItem('ballSortProgress', JSON.stringify(progress));
  }

  /**
   * Load progress from localStorage
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('ballSortProgress');
      if (!saved || !this.levelIndex) return;
      
      const progress = JSON.parse(saved);
      if (progress.version !== this.levelIndex.version) return; // Version mismatch
      
      // Apply saved progress
      for (const savedLevel of progress.levels) {
        const levelInfo = this.levelIndex.levels.find(l => l.id === savedLevel.id);
        if (levelInfo) {
          levelInfo.unlocked = savedLevel.unlocked;
          levelInfo.completed = savedLevel.completed;
          levelInfo.stars = savedLevel.stars;
          levelInfo.bestMoves = savedLevel.bestMoves;
        }
      }
      
      console.log('Progress loaded from localStorage');
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  /**
   * Reset all progress
   */
  resetProgress() {
    if (!this.levelIndex) return;
    
    for (const level of this.levelIndex.levels) {
      level.unlocked = level.id === 1; // Only first level unlocked
      level.completed = false;
      level.stars = 0;
      level.bestMoves = null;
    }
    
    localStorage.removeItem('ballSortProgress');
    console.log('Progress reset');
  }

  /**
   * Get current level
   */
  getCurrentLevel() {
    return this.currentLevel;
  }

  /**
   * Get level info by ID
   */
  getLevelInfo(levelId) {
    if (!this.levelIndex) return null;
    return this.levelIndex.levels.find(l => l.id === levelId);
  }

  /**
   * Create a copy of level data for gameplay (to avoid modifying original)
   */
  createGameLevel(levelData = this.currentLevel) {
    if (!levelData) return null;
    
    return {
      ...levelData,
      tubes: levelData.tubes.map(tube => ({
        ...tube,
        balls: [...tube.balls] // Create copy of balls array
      })),
      moves: 0,
      startTime: Date.now(),
      completed: false
    };
  }
}

// Export for use in other files
window.LevelManager = LevelManager;
