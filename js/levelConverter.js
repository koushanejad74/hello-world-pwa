/**
 * Level Converter - Converts your format to game format
 * Converts distribution_*.json files to game-ready level files
 */

class LevelConverter {
  constructor() {
    this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'cyan'];
  }

  /**
   * Convert your puzzle format to game format
   */
  convertPuzzle(puzzleData, levelId, levelName) {
    const { initialState, bottleCapacities, desiredLevel, movesToSolve } = puzzleData.puzzle;
    
    // Generate tubes with balls
    const tubes = [];
    const usedColors = new Set();
    
    for (let i = 0; i < initialState.length; i++) {
      const ballCount = initialState[i];
      const capacity = bottleCapacities[i];
      
      // Generate balls for this tube
      const balls = [];
      
      if (ballCount > 0) {
        // Create balls - we need to distribute colors
        // For simplicity, we'll use sequential colors for each tube
        const colorIndex = i % this.colors.length;
        const color = this.colors[colorIndex];
        usedColors.add(color);
        
        // Fill tube with balls (all same color for now - we'll improve this)
        for (let j = 0; j < ballCount; j++) {
          balls.push(color);
        }
      }
      
      tubes.push({
        id: i,
        balls: balls,
        capacity: capacity
      });
    }
    
    // Create a more realistic color distribution
    const colorsArray = Array.from(usedColors);
    const totalBalls = initialState.reduce((sum, count) => sum + count, 0);
    const ballsPerColor = Math.floor(totalBalls / colorsArray.length);
    
    // Redistribute balls more realistically
    const allBalls = [];
    for (let i = 0; i < colorsArray.length; i++) {
      const color = colorsArray[i];
      for (let j = 0; j < ballsPerColor; j++) {
        allBalls.push(color);
      }
    }
    
    // Shuffle balls
    this.shuffleArray(allBalls);
    
    // Redistribute to tubes based on initial state
    let ballIndex = 0;
    for (let i = 0; i < tubes.length; i++) {
      const ballCount = initialState[i];
      tubes[i].balls = [];
      
      for (let j = 0; j < ballCount; j++) {
        if (ballIndex < allBalls.length) {
          tubes[i].balls.push(allBalls[ballIndex++]);
        }
      }
    }
    
    return {
      levelId: levelId,
      name: levelName,
      difficulty: this.getDifficulty(movesToSolve, tubes.length),
      tubes: tubes,
      colors: colorsArray,
      moves: 0,
      minMoves: movesToSolve,
      stars: {
        "1": Math.ceil(movesToSolve * 2.0),
        "2": Math.ceil(movesToSolve * 1.5), 
        "3": movesToSolve
      }
    };
  }
  
  /**
   * Determine difficulty based on moves and complexity
   */
  getDifficulty(moves, tubeCount) {
    if (moves <= 6 && tubeCount <= 5) return "easy";
    if (moves <= 12 && tubeCount <= 7) return "medium";
    return "hard";
  }
  
  /**
   * Shuffle array in place
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  /**
   * Extract level number from filename
   */
  extractLevelNumber(filename) {
    const match = filename.match(/distribution_23555_4_(\d+)_solution\.json/);
    return match ? parseInt(match[1]) : 0;
  }
}

// Convert all levels function
async function convertAllLevels() {
  const converter = new LevelConverter();
  const convertedLevels = [];
  
  try {
    // Get list of all distribution files
    const response = await fetch('./levels/');
    // Since we can't list directory via fetch, we'll work with known files
    
    const fileNumbers = [25, 28, 29, 32, 34, 37, 38, 39, 40, 50, 51, 52, 53, 54, 56, 58, 60, 61, 62, 63, 66, 68, 71, 72, 79, 81, 84, 85, 86, 87, 91, 95, 96, 101, 102, 104, 115, 116, 119, 120, 121, 125, 127, 130, 131, 135, 139, 140, 141, 142];
    
    for (let i = 0; i < fileNumbers.length; i++) {
      const fileNum = fileNumbers[i];
      const filename = `distribution_23555_4_${fileNum}_solution.json`;
      
      try {
        const response = await fetch(`./levels/${filename}`);
        const puzzleData = await response.json();
        
        const converted = converter.convertPuzzle(
          puzzleData,
          i + 1,
          `Level ${i + 1} - Puzzle ${fileNum}`
        );
        
        convertedLevels.push(converted);
        console.log(`Converted level ${i + 1}: ${filename}`);
        
      } catch (error) {
        console.error(`Failed to convert ${filename}:`, error);
      }
    }
    
    console.log(`Converted ${convertedLevels.length} levels`);
    return convertedLevels;
    
  } catch (error) {
    console.error('Failed to convert levels:', error);
    return [];
  }
}

// Export for use
window.LevelConverter = LevelConverter;
window.convertAllLevels = convertAllLevels;
