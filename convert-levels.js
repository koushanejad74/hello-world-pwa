#!/usr/bin/env node

/**
 * Ball Sort Puzzle Level Converter
 * Converts your distribution_*.json files to proper game levels
 */

const fs = require('fs');
const path = require('path');

class BallSortConverter {
  constructor() {
    this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'cyan'];
  }

  /**
   * Convert puzzle data to game format with proper color distribution
   */
  convertPuzzle(puzzleData, levelId, originalNumber) {
    const { initialState, bottleCapacities, desiredLevel, movesToSolve } = puzzleData.puzzle;
    
    // Calculate how many colors we need based on desiredLevel and total balls
    const totalBalls = initialState.reduce((sum, count) => sum + count, 0);
    const numColors = Math.ceil(totalBalls / desiredLevel);
    const ballsPerColor = desiredLevel;
    
    // Create color distribution
    const allBalls = [];
    for (let i = 0; i < numColors; i++) {
      const color = this.colors[i % this.colors.length];
      for (let j = 0; j < ballsPerColor; j++) {
        allBalls.push(color);
      }
    }
    
    // Shuffle the balls to create a challenging initial state
    this.shuffleArray(allBalls);
    
    // Create tubes
    const tubes = [];
    let ballIndex = 0;
    
    for (let i = 0; i < initialState.length; i++) {
      const ballCount = initialState[i];
      const capacity = bottleCapacities[i];
      const balls = [];
      
      // Fill this tube with balls
      for (let j = 0; j < ballCount; j++) {
        if (ballIndex < allBalls.length) {
          balls.push(allBalls[ballIndex++]);
        }
      }
      
      tubes.push({
        id: i,
        balls: balls,
        capacity: capacity
      });
    }
    
    // Get unique colors used
    const usedColors = [...new Set(allBalls)];
    
    return {
      levelId: levelId,
      name: `Level ${levelId} - Puzzle ${originalNumber}`,
      difficulty: this.getDifficulty(movesToSolve, tubes.length, numColors),
      tubes: tubes,
      colors: usedColors,
      moves: 0,
      minMoves: movesToSolve,
      stars: {
        "1": Math.ceil(movesToSolve * 2.5),
        "2": Math.ceil(movesToSolve * 1.8),
        "3": movesToSolve
      },
      originalFile: `distribution_23555_4_${originalNumber}_solution.json`
    };
  }
  
  /**
   * Determine difficulty based on various factors
   */
  getDifficulty(moves, tubeCount, colorCount) {
    const complexity = moves + (tubeCount * 0.5) + (colorCount * 0.3);
    
    if (complexity <= 8) return "easy";
    if (complexity <= 15) return "medium";
    return "hard";
  }
  
  /**
   * Shuffle array in place (Fisher-Yates algorithm)
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  /**
   * Extract puzzle number from filename
   */
  extractPuzzleNumber(filename) {
    const match = filename.match(/distribution_23555_4_(\d+)_solution\.json/);
    return match ? parseInt(match[1]) : null;
  }
}

/**
 * Convert all distribution files to game levels
 */
async function convertAllLevels() {
  const converter = new BallSortConverter();
  const levelsDir = './levels';
  
  try {
    // Get all distribution files
    const files = fs.readdirSync(levelsDir)
      .filter(file => file.startsWith('distribution_') && file.endsWith('_solution.json'))
      .sort((a, b) => {
        const numA = converter.extractPuzzleNumber(a);
        const numB = converter.extractPuzzleNumber(b);
        return numA - numB;
      });
    
    console.log(`Found ${files.length} puzzle files to convert`);
    
    const convertedLevels = [];
    const levelIndex = {
      version: "1.0.0",
      totalLevels: files.length,
      levels: [],
      difficulties: {
        easy: { name: "Easy", color: "#4CAF50", levels: [] },
        medium: { name: "Medium", color: "#FF9800", levels: [] },
        hard: { name: "Hard", color: "#F44336", levels: [] }
      }
    };
    
    // Convert each file
    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const puzzleNumber = converter.extractPuzzleNumber(filename);
      const levelId = i + 1;
      
      try {
        console.log(`Converting ${filename} -> level-${levelId.toString().padStart(3, '0')}.json`);
        
        // Read original file
        const filePath = path.join(levelsDir, filename);
        const puzzleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Convert to game format
        const gameLevel = converter.convertPuzzle(puzzleData, levelId, puzzleNumber);
        convertedLevels.push(gameLevel);
        
        // Write converted level file
        const outputFilename = `level-${levelId.toString().padStart(3, '0')}.json`;
        const outputPath = path.join(levelsDir, outputFilename);
        fs.writeFileSync(outputPath, JSON.stringify(gameLevel, null, 2));
        
        // Add to index
        levelIndex.levels.push({
          id: levelId,
          file: outputFilename,
          name: gameLevel.name,
          difficulty: gameLevel.difficulty,
          unlocked: levelId === 1, // Only first level unlocked
          completed: false,
          stars: 0,
          bestMoves: null
        });
        
        // Add to difficulty category
        levelIndex.difficulties[gameLevel.difficulty].levels.push(levelId);
        
      } catch (error) {
        console.error(`Failed to convert ${filename}:`, error.message);
      }
    }
    
    // Write updated level index
    const indexPath = path.join(levelsDir, 'levels-index.json');
    fs.writeFileSync(indexPath, JSON.stringify(levelIndex, null, 2));
    
    console.log(`\n✅ Successfully converted ${convertedLevels.length} levels!`);
    console.log(`📊 Difficulty distribution:`);
    console.log(`   Easy: ${levelIndex.difficulties.easy.levels.length} levels`);
    console.log(`   Medium: ${levelIndex.difficulties.medium.levels.length} levels`);
    console.log(`   Hard: ${levelIndex.difficulties.hard.levels.length} levels`);
    
    return convertedLevels;
    
  } catch (error) {
    console.error('Failed to convert levels:', error);
    return [];
  }
}

// Run conversion if called directly
if (require.main === module) {
  convertAllLevels().then(() => {
    console.log('\n🎮 Level conversion complete!');
  });
}

module.exports = { BallSortConverter, convertAllLevels };
